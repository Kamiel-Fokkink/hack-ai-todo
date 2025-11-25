from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from .extraction import get_orq_client, extract
from .simplify import simplify
from .taskify import classify_tasks

class SimplifyRequest(BaseModel):
    language: str = Field(..., min_length=2)
    level: str = Field(..., min_length=1)

class TaskRequest(BaseModel):
    name: str = Field(..., min_length=1)
    task: str = Field(..., min_length=1)
    # Optional fields to associate tasks explicitly
    employer: Optional[str] = None
    related_output_filename: Optional[str] = None  # e.g., "20251125_1230_AcmeCorp.json"

from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
async def upload_instruction(
    file: UploadFile = File(...),
    employer: str = Form(...)
):
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are allowed")

    try:
        # Read file content
        content = await file.read()
        text_content = content.decode('utf-8')

        # Initialize Orq client
        api_key = os.getenv("ORQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ORQ_API_KEY not found in environment")
        
        client = get_orq_client(api_key)

        # Extract information
        extraction_result = extract(client, text_content)

        # Parse extraction result
        try:
            # Remove markdown code blocks if present
            clean_result = extraction_result.strip()
            if clean_result.startswith("```json"):
                clean_result = clean_result[7:]
            elif clean_result.startswith("```"):
                clean_result = clean_result[3:]
            
            if clean_result.endswith("```"):
                clean_result = clean_result[:-3]
            
            parsed_extraction = json.loads(clean_result.strip())
        except json.JSONDecodeError:
            # Fallback if parsing fails
            parsed_extraction = {"raw_extraction": extraction_result}

        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        result = {
            "metadata": {
                "employer": employer,
                "upload_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "filename": file.filename
            },
            **parsed_extraction
        }

        # Save to file
        safe_employer = "".join([c for c in employer if c.isalnum() or c in (' ', '-', '_')]).strip().replace(' ', '_')
        filename = f"{timestamp}_{safe_employer}.json"
        # Ensure data directory exists
        DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "output")
        os.makedirs(DATA_DIR, exist_ok=True)
        file_path = os.path.join(DATA_DIR, filename)
        
        with open(file_path, 'w') as f:
            json.dump(result, f, indent=2)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simplify")
async def simplify_content(request: SimplifyRequest):
    try:
        # Initialize Orq client
        api_key = os.getenv("ORQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ORQ_API_KEY not found in environment")
        
        client = get_orq_client(api_key)

        # Find latest file in data/output
        DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "output")
        files = [os.path.join(DATA_DIR, f) for f in os.listdir(DATA_DIR) if f.endswith('.json')]
        if not files:
            raise HTTPException(status_code=404, detail="No output files found to simplify")
        
        latest_file = max(files, key=os.path.getctime)
        
        with open(latest_file, 'r') as f:
            file_content = json.load(f)
            metadata = file_content.pop("metadata", {})
            content_to_simplify = json.dumps(file_content, indent=2)

        simplified_content = simplify(client, request.language, request.level, content_to_simplify)

        try:
            start_index = simplified_content.find('{')
            end_index = simplified_content.rfind('}')

            if start_index != -1 and end_index != -1 and end_index > start_index:
                json_str = simplified_content[start_index : end_index + 1]
                parsed_content = json.loads(json_str)

                # Classify which sections contain tasks
                task_classification = classify_tasks(client, parsed_content)

                # Return with metadata and task classification
                return {
                    "content": parsed_content,
                    "task_classification": task_classification,
                    "metadata": metadata,
                    "related_output_filename": os.path.basename(latest_file)
                }
            else:
                return {
                    "metadata": metadata,
                    "simplified_content": simplified_content,
                    "related_output_filename": os.path.basename(latest_file)
                }
        except json.JSONDecodeError:
            return {
                "metadata": metadata,
                "simplified_content": simplified_content,
                "related_output_filename": os.path.basename(latest_file)
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/task")
async def submit_task(request: TaskRequest):
    # Basic validation (Pydantic already enforces non-empty, but we can add trimming)
    name = request.name.strip()
    task_text = request.task.strip()
    if not name or not task_text:
        raise HTTPException(status_code=400, detail="Fields 'name' and 'task' must be non-empty.")

    try:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        TASKS_DIR = os.path.join(base_dir, "data", "tasks")
        OUTPUT_DIR = os.path.join(base_dir, "data", "output")
        os.makedirs(TASKS_DIR, exist_ok=True)

        # Try to associate with latest output metadata if not explicitly provided
        related_output_filename = request.related_output_filename
        related_metadata = {}
        if related_output_filename:
            # Use explicit association
            output_path = os.path.join(OUTPUT_DIR, related_output_filename)
            if os.path.isfile(output_path):
                with open(output_path, "r") as f:
                    out_json = json.load(f)
                    related_metadata = out_json.get("metadata", {})
            else:
                # If file not found, keep the filename reference but no metadata
                related_metadata = {"warning": f"Related output file '{related_output_filename}' not found."}
        else:
            # Find latest output and associate implicitly
            output_files = [os.path.join(OUTPUT_DIR, f) for f in os.listdir(OUTPUT_DIR) if f.endswith(".json")]
            if output_files:
                latest_output = max(output_files, key=os.path.getctime)
                related_output_filename = os.path.basename(latest_output)
                with open(latest_output, "r") as f:
                    out_json = json.load(f)
                    related_metadata = out_json.get("metadata", {})
            else:
                related_metadata = {"warning": "No output files found to associate with this task."}

        # If employer explicitly provided, override or augment
        if request.employer:
            related_metadata["employer"] = request.employer

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = "".join([c for c in name if c.isalnum() or c in (" ", "-", "_")]).strip().replace(" ", "_")
        task_id = f"{timestamp}_{safe_name}"

        task_record = {
            "id": task_id,
            "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "name": name,
            "task": task_text,
            "related_output_filename": related_output_filename,
            "metadata": related_metadata,
            "status": "queued"  # initial status; downstream workers can update
        }

        # Persist the task
        task_path = os.path.join(TASKS_DIR, f"{task_id}.json")
        with open(task_path, "w") as f:
            json.dump(task_record, f, indent=2)

        # Placeholder: enqueue to a worker/queue system if available (e.g., Celery, RQ, or a simple background task)
        # enqueue_task(task_record)

        return {
            "status": "success",
            "task_id": task_id,
            "task_path": task_path,
            "task": task_record
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files
app.mount("/", StaticFiles(directory="server/static", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)