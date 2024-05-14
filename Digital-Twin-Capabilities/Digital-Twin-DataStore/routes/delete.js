const express = require('express');
const fs = require('fs');
const path = require('path');
const { uploadDir, authMiddleware } = require('../config');

const router = express.Router();

/**
 * @swagger
 * /file/{name}:
 *   delete:
 *     summary: Deletes a file by its name.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file to delete.
 *     responses:
 *       200:
 *         description: File deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Error deleting file.
 */
router.delete('/file/:name', authMiddleware, (req, res) => {
  try {
    const fileName = req.params.name;
    const filePath = path.join(uploadDir, fileName);
    fs.unlinkSync(filePath);
    res.json({ message: `File '${fileName}' deleted successfully.` });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
