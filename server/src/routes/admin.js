
import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check', protect, adminOnly, (req, res) => {
    res.json({ success: true, message: 'Admin access verified' });
});

export default router;
