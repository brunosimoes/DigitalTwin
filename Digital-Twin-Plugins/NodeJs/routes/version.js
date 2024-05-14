const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns the version information.
 *     responses:
 *       200:
 *         description: Version information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Error retrieving version information.
 */
router.get('/version', (req, res) => {
  try {
        res.json({ version: "1.0.0" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
