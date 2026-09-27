import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  getAllOrganizers,
  verifyOrganizer,
  getAllBookings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(protect, authorize('ADMIN'));

router.get('/stats', asyncHandler(getDashboardStats));
router.get('/users', asyncHandler(getAllUsers));
router.patch('/users/:id', asyncHandler(updateUser));
router.get('/organizers', asyncHandler(getAllOrganizers));
router.patch('/organizers/:id/verify', asyncHandler(verifyOrganizer));
router.get('/bookings', asyncHandler(getAllBookings));

export default router;
