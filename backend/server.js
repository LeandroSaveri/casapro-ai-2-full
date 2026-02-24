// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { Project } from './models/Project.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = new User({ email, password, name });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, name, plan: user.plan } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, plan: user.plan } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Project routes
app.get('/api/projects', authMiddleware, async (req, res) => {
  const projects = await Project.find({ userId: req.userId })
    .select('name metadata modifiedAt')
    .sort({ modifiedAt: -1 });
  res.json(projects);
});

app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  const projectCount = await Project.countDocuments({ userId: req.userId });
  
  if (user.plan === 'free' && projectCount >= 3) {
    return res.status(403).json({ error: 'Free plan limit reached' });
  }
  
  const project = new Project({
    userId: req.userId,
    ...req.body
  });
  await project.save();
  
  res.json({ id: project._id, url: `/project/${project._id}` });
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json({ id: project._id });
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  await Project.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});

// Stripe webhook for payments
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  // Implementar integração Stripe
  res.json({ received: true });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  });
