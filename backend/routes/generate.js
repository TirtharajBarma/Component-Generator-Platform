import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { generateComponent } from '../utils/gemini.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { prompt, chat, code } = req.body;
  try {
    const result = await generateComponent({ prompt, chat, code });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Gemini generation failed' });
  }
});

export default router; 