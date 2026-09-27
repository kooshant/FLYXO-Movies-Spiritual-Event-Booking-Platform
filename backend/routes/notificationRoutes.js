import { Router } from 'express';
import { getNotifications, markAsRead, markAllRead, getUnreadCount } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(protect);
router.get('/', asyncHandler(getNotifications));
router.get('/unread-count', asyncHandler(getUnreadCount));
router.patch('/:id/read', asyncHandler(markAsRead));
router.patch('/read-all', asyncHandler(markAllRead));

export default router;
