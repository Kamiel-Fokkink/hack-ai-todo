document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('file');
    const filePlaceholderText = document.querySelector('.file-upload-placeholder .text');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.querySelector('.spinner');
    const btnText = document.querySelector('.btn-text');
    const resultSection = document.getElementById('resultSection');
    const resEmployer = document.getElementById('resEmployer');
    const resDate = document.getElementById('resDate');
    const resContent = document.getElementById('resContent');

    // Update file input text when file is selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            filePlaceholderText.textContent = e.target.files[0].name;
        } else {
            filePlaceholderText.textContent = 'Click to select a file';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const employer = document.getElementById('employer').value;
        const file = fileInput.files[0];

        if (!employer || !file) {
            alert('Please fill in all fields');
            return;
        }

        // Set loading state
        setLoading(true);
        resultSection.classList.add('hidden');

        const formData = new FormData();
        formData.append('employer', employer);
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const data = await response.json();
            displayResult(data);

        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            spinner.classList.remove('hidden');
            btnText.textContent = 'Processing...';
        } else {
            spinner.classList.add('hidden');
            btnText.textContent = 'Upload & Extract';
        }
    }

    function displayResult(data) {
        resEmployer.textContent = data.employer;
        resDate.textContent = new Date(data.upload_date).toLocaleString();

        // Format JSON nicely
        const formattedJson = JSON.stringify(data.extraction, null, 2);
        resContent.textContent = formattedJson;

        resultSection.classList.remove('hidden');

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
});
