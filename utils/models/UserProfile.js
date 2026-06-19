const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  nativeLanguage: { type: String, default: 'en' },
  learningLanguage: { type: String, default: 'pt' },
  language: { type: String, default: 'en' },
  ageGroup: { type: String, default: '' },
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  bio: { type: String, default: '' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  messagesSent: { type: Number, default: 0 },
  voiceMinutes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);