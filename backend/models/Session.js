import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat: { type: [
    {
      role: String, // 'user' or 'ai'
      content: String,
      timestamp: { type: Date, default: Date.now },
    }
  ], default: [] },
  code: {
    jsx: { type: String, default: '' },
    css: { type: String, default: '' },
  },
  uiState: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema); 