import express from 'express';
import Session from '../models/Session.js';
import { authMiddleware } from '../middleware/auth.js';
import { redisClient } from '../db.js';

const router = express.Router();

// Create new session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const session = await Session.create({ user: req.userId });
    // Cache new session in Redis
    await redisClient.set(`session:${session._id}`, JSON.stringify(session));
    res.status(201).json(session);
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ message: 'Could not create session', error: err.message });
  }
});

// List all sessions for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ message: 'Could not fetch sessions', error: err.message });
  }
});

// Load a specific session (with Redis cache)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Try Redis cache first
    const cached = await redisClient.get(`session:${req.params.id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const session = await Session.findOne({ _id: req.params.id, user: req.userId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    // Cache in Redis
    await redisClient.set(`session:${session._id}`, JSON.stringify(session));
    res.json(session);
  } catch (err) {
    console.error('Fetch session error:', err);
    res.status(500).json({ message: 'Could not fetch session', error: err.message });
  }
});

// Update (auto-save) a session (update Redis too)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    // Update Redis cache
    await redisClient.set(`session:${session._id}`, JSON.stringify(session));
    res.json(session);
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ message: 'Could not update session', error: err.message });
  }
});

export default router; 