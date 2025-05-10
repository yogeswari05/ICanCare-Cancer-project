const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/authMiddleware');
const Document = require('../models/document.model');
const { encryptFile, decryptFile } = require('../utils/encryption');
const { OpenAI } = require("openai");



const { fromPath } = require("pdf2pic");
const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage();
const fileUpload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', authenticateToken, fileUpload.single('document'), async (req, res) => {
    try {
        console.log('File upload request received');
        console.log('Request body:', req.body);
        console.log('File details:', req.file ? { 
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        } : 'No file');
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { caseId } = req.body;
        if (!caseId) {
            return res.status(400).json({ message: 'Case ID is required' });
        }

        const userId = req.user ? (req.user.id || req.user._id || "unknown") : "unknown";
        console.log('User ID from request:', userId);
        
        console.log('Encrypting file...');
        let encryptionResult;
        try {
            encryptionResult = encryptFile(req.file.buffer);
            console.log('File encrypted successfully');
        } catch (encryptError) {
            console.error('Encryption failed:', encryptError);
            return res.status(500).json({ message: 'Failed to encrypt file', error: encryptError.message });
        }
        
        const documentData = {
            filename: req.file.originalname,
            filesize: req.file.size,
            filetype: req.file.mimetype,
            fileData: encryptionResult.encryptedData,
            encryptionIV: encryptionResult.iv,
            caseId: caseId,
            uploadedBy: userId
        };
        
        console.log('Creating document with data:', {
            filename: documentData.filename,
            filesize: documentData.filesize,
            filetype: documentData.filetype,
            caseId: documentData.caseId,
            uploadedBy: documentData.uploadedBy
        });
        
        try {
            const document = new Document(documentData);
            console.log('Document model instance created');
            
            const savedDoc = await document.save();
            console.log('Document saved successfully with ID:', savedDoc._id);
            
            res.status(201).json({
                _id: savedDoc._id,
                filename: savedDoc.filename,
                filetype: savedDoc.filetype,
                filesize: savedDoc.filesize,
                createdAt: savedDoc.createdAt,
                uploadedAt: savedDoc.uploadedAt,
                caseId: savedDoc.caseId
            });
        } catch (dbError) {
            console.error('Database error saving document:', dbError);
            return res.status(500).json({ 
                message: 'Failed to save document to database', 
                error: dbError.message 
            });
        }
    } catch (error) {
        console.error('Detailed error in document upload:', error);
        res.status(500).json({ 
            message: 'Server error during document upload', 
            error: error.message
        });
    }
});

router.get('/download/:id', authenticateToken, async (req, res) => {
    try {
        console.log('Download request for document ID:', req.params.id);
        
        const document = await Document.findById(req.params.id);
        if (!document) {
            console.log('Document not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Document not found' });
        }
        
        console.log('Document found, decrypting...');
        const decryptedData = decryptFile(document.fileData, document.encryptionIV);
        console.log('Document decrypted successfully');
        
        res.setHeader('Content-Type', document.filetype);
        res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
        
        res.send(decryptedData);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/summary/:id', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching document for summary:', req.params.id);
        
        const document = await Document.findById(req.params.id);
        if (!document) {
            console.log('Document not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Document not found' });
        }
        
        console.log('Document found, decrypting...');
        const decryptedData = decryptFile(document.fileData, document.encryptionIV);
        console.log('Document decrypted successfully');

        // Save to current directory
        const tempPath = path.join(__dirname, 'temp.pdf');
        fs.writeFileSync(tempPath, decryptedData);
        console.log('Document saved to:', tempPath);

        // Extract the text from the pdf
        const pdfPath = path.resolve(__dirname, "temp.pdf");
        const convert = fromPath(pdfPath, {
            density: 200,
            saveFilename: "page",
            savePath: "./images",
            format: "png",
            width: 1200,
            height: 1600,
        });

        try {
            if (!fs.existsSync("./images")) {
                fs.mkdirSync("./images");
            }

            console.log("Converting PDF pages to images...");
            const totalPages = await convert.bulk(-1);

            console.log("Starting OCR...");
            let fullText = "";

            for (const page of totalPages) {
                const result = await Tesseract.recognize(
                    page.path,
                    "eng",
                    { logger: m => console.log(m.status, m.progress) }
                );
                fullText += result.data.text + "\n\n";
            }

            console.log("✅ OCR complete");
            // get summary of the text

            const openai = new OpenAI({
                apiKey:"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"
              });


            async function summarizeText(text) {
                try {
                  const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo", // or "gpt-4" if you have access
                    messages: [
                      { role: "system", content: "You are a helpful assistant that analyzes medical reports and give the summary for a layman to understand" },
                      { role: "user", content: `analyze the following text:\n\n${text} \n\n and do not include any details of the hospital, patient or the doctor in the output` }
                    ],
                    temperature: 0.5
                  });
              
                  const summary = completion.choices[0].message.content;
                  return summary;
                } catch (err) {
                  console.error("Error summarizing text:", err);
                }
              }

            const summary = await summarizeText(fullText);
            console.log("Summary:", summary);

            if (!summary) {
                throw new Error('Failed to generate summary');
            }

            res.json({ summary: summary });
        } catch (err) {
            console.error("❌ Error during OCR:", err);
            res.status(500).json({ message: 'OCR processing failed', error: err.message });
        }

    } catch (error) {
        console.error('Error processing document for summary:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:caseId', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching documents for case:', req.params.caseId);
        
        const documents = await Document.find({ caseId: req.params.caseId })
            .select('-fileData -encryptionIV')
            .sort({ createdAt: -1 });
            
        console.log(`Found ${documents.length} documents for case`);
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
