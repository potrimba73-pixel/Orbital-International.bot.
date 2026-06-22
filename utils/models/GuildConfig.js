const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  roles: {
    native: { type: Map, of: String, default: {} },
    learning: { type: Map, of: String, default: {} },
    age: { type: Map, of: String, default: {} },
    region: { type: Map, of: String, default: {} },
    gender: { type: Map, of: String, default: {} },
    member: { type: String, default: '' }
  },
  channels: {
    rules: { type: String, default: '' },
    logs: { type: String, default: '' }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.GuildConfig || mongoose.model('GuildConfig', guildConfigSchema);
