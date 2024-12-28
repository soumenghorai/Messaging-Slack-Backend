import express from 'express';

import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { getMessages } from '../../controllers/messageController.js';

const router = express.Router();

router.get('/messages', isAuthenticated, getMessages);

export default router;
