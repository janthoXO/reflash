# PDF Upload API Documentation

## Upload Endpoint

**POST** `/api/upload`

### Headers Required:
- `Content-Type: application/pdf`
- `X-Filename: your-file-name.pdf`

### Example Usage:

#### Using JavaScript/Frontend:
```javascript
async function uploadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    
    const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/pdf',
            'X-Filename': file.name
        },
        body: arrayBuffer
    });
    
    return await response.json();
}

// Usage with file input
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        try {
            const result = await uploadPDF(file);
            console.log('Upload result:', result);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }
});
```

#### Using curl:
```bash
curl -X POST \
  -H "Content-Type: application/pdf" \
  -H "X-Filename: example.pdf" \
  --data-binary @path/to/your/file.pdf \
  http://localhost:8080/api/upload
```

#### Using Node.js:
```javascript
const fs = require('fs');

async function uploadPDFWithNodejs(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    
    const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/pdf',
            'X-Filename': filename
        },
        body: fileBuffer
    });
    
    return await response.json();
}
```

### Response Format:
```json
{
    "message": "File processed successfully",
    "filename": "example.pdf",
    "result": [
        {
            "filename": "example.pdf",
            "processed": true,
            "result": {
                "status": "success",
                "message": "LLM processing completed for example.pdf",
                "flashcards": [
                    {
                        "question": "Sample question from PDF",
                        "answer": "Sample answer from PDF",
                        "difficulty": "medium"
                    }
                ]
            }
        }
    ]
}
```

### Error Responses:
- **400 Bad Request**: Invalid file type or missing filename
- **500 Internal Server Error**: Server processing error

## LLM Integration

The `callLLMApi` function in `service.ts` is currently a placeholder. To integrate with an actual LLM service:

1. Replace the mock implementation with your LLM provider's API
2. Configure API keys in environment variables
3. Handle PDF text extraction if needed
4. Parse LLM responses into flashcard format

### Example LLM Integration:
```javascript
async function callLLMApi(fileData) {
    const response = await fetch(process.env.LLM_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        },
        body: JSON.stringify({
            file: fileData.content,
            filename: fileData.filename,
            task: 'extract_flashcards',
            prompt: 'Extract key concepts and create flashcards from this PDF'
        })
    });
    
    return await response.json();
}
```