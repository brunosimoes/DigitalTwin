const express = require('express');
const fs = require('fs');
const path = require('path');
const { uploadDir, authMiddleware } = require('../config');

const router = express.Router();

/**
 * @swagger
 * /catalogue:
 *   get:
 *     summary: Lists all files.
 *     responses:
 *       200:
 *         description: List of files.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *       400:
 *         description: Error retrieving files.
 */
router.get('/catalogue', authMiddleware, (req, res) => {
  try {
    const searchFiles = (dir) => {
      let files = [];
      fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
        if (file.isDirectory()) {
          files = files.concat(searchFiles(path.join(dir, file.name)));
        } else {
          files.push(path.join(dir, file.name));
        }
      });
      return files;
    };

    const files = searchFiles(uploadDir);
    const baseUrl = req.baseUrl;

    res.json(files.map((file) => ({
      filename: `${baseUrl}/${file.replace(/\\/g, '/')}`
    })));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
