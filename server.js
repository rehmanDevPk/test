const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// API Routes for PDF Processing
app.post('/api/process', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const action = req.body.action; // e.g., 'merge', 'split', 'compress'
        
        // --- SIMULATED PROCESSING ---
        // In a real application, you would use libraries like pdf-lib or cloud APIs here.
        // For demonstration, we simulate processing time and return a success message.
        
        setTimeout(() => {
            // For demo, we just send back the original file as the "processed" result
            // Normally, you would generate a new file and send its URL.
            res.json({
                success: true,
                message: `File successfully processed for action: ${action}`,
                downloadUrl: `/api/download/${req.file.filename}`,
                originalName: req.file.originalname
            });
        }, 2000); // Simulate 2 second processing time

    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ success: false, message: 'Server error during processing' });
    }
});

// Download processed file
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Fallback to index.html for unknown routes (SPA-like behavior if needed)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 PDF Tools Server running at http://localhost:${PORT}`);
});
