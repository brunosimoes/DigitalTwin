const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadDir, maxSize, authMiddleware } = require('../config');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: maxSize } });

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Uploads a GLB file.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The file to upload.
 *     responses:
 *       200:
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: Error uploading file.
 */
router.post('/upload', authMiddleware, upload.fields([{ name: 'file' }]), async (req, res) => {
  try {
    const { file } = req.files;
    const fileFilename = file[0].filename;
    fs.renameSync(file[0].path, path.join(uploadDir, fileFilename));
    res.json({ message: 'File uploaded successfully.', url: `/static/${fileFilename}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
