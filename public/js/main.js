// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    toast.innerHTML = `${icon} <span style="margin-left: 8px;">${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// File Upload Logic (Drag & Drop)
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

if (dropZone && fileInput) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle selected files via button
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        
        // Size validation (50MB)
        if (file.size > 50 * 1024 * 1024) {
            showToast('File is too large. Max size is 50MB.', 'error');
            return;
        }

        uploadFile(file);
    }

    function uploadFile(file) {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('tool') || 'process';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', action);

        const progressArea = document.getElementById('progressArea');
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressText = document.getElementById('progressText');
        const resultArea = document.getElementById('resultArea');

        // Reset UI
        document.querySelector('.upload-btn').style.display = 'none';
        document.querySelector('.upload-icon').style.display = 'none';
        document.querySelector('h3').style.display = 'none';
        document.querySelector('p').style.display = 'none';
        resultArea.style.display = 'none';
        
        progressArea.style.display = 'block';
        progressText.innerText = 'Uploading...';

        // Fake progress for UI demonstration since local testing is too fast
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90; // Hold at 90 until fetch completes
            updateProgress(progress);
        }, 300);

        function updateProgress(val) {
            progressBar.style.width = val + '%';
            progressPercent.innerText = Math.round(val) + '%';
        }

        // Actual API Call
        fetch('/api/process', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(interval);
            updateProgress(100);
            progressText.innerText = 'Processing Complete!';
            
            setTimeout(() => {
                if (data.success) {
                    showToast(data.message);
                    progressArea.style.display = 'none';
                    resultArea.style.display = 'block';
                    
                    const downloadBtn = document.getElementById('downloadBtn');
                    downloadBtn.href = data.downloadUrl;
                    downloadBtn.download = `processed_${data.originalName}`;
                } else {
                    showToast(data.message || 'An error occurred.', 'error');
                    resetUI();
                }
            }, 500);
        })
        .catch(error => {
            clearInterval(interval);
            console.error('Error:', error);
            showToast('Server error. Could not process file.', 'error');
            resetUI();
        });
    }

    function resetUI() {
        document.getElementById('progressArea').style.display = 'none';
        document.querySelector('.upload-btn').style.display = 'inline-flex';
        document.querySelector('.upload-icon').style.display = 'block';
        document.querySelector('h3').style.display = 'block';
        document.querySelector('p').style.display = 'block';
    }
}
