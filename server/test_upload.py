import requests
import os

def test_upload():
    url = "http://localhost:8000/upload"
    file_path = "data/example1.txt"
    
    # Ensure example file exists
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write("This is a test instruction file for AcmeCorp.")

    with open(file_path, "rb") as f:
        files = {"file": f}
        data = {"employer": "TestEmployer"}
        
        try:
            response = requests.post(url, files=files, data=data)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200:
                print("Test PASSED")
            else:
                print("Test FAILED")
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    test_upload()
