// backend/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  data: {
    walls: Array,
    rooms: Array,
    doors: Array,
    windows: Array,
    furniture: Array
  },
  metadata: {
    area: Number,
    roomCount: Number,
    wallCount: Number
  },
  isPublic: { type: Boolean, default: false },
  shareUrl: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
  this.modifiedAt = new Date();
  next();
});

export const Project = mongoose.model('Project', projectSchema);
