import { Router } from 'express';
import {
  getSeats,
  createBookingOrder,
  holdSeats,
  cancelBooking,
  getMyBookings,
  getBookingById,
  getOrganizerBookings,
  getOrganizerAnalytics,
  createDonation,
} from '../controllers/bookingController.js';
import { verifyBookingPayment } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/seats/:eventId', protect, asyncHandler(getSeats));
router.post('/hold', protect, asyncHandler(holdSeats));
router.get('/organizer/list', protect, authorize('ORGANIZER'), asyncHandler(getOrganizerBookings));
router.get('/organizer/analytics', protect, authorize('ORGANIZER'), asyncHandler(getOrganizerAnalytics));
router.post('/order', protect, asyncHandler(createBookingOrder));
router.post('/verify', protect, asyncHandler(verifyBookingPayment));
router.get('/my', protect, asyncHandler(getMyBookings));
router.post('/donate', protect, asyncHandler(createDonation));
router.get('/:id', protect, asyncHandler(getBookingById));
router.patch('/:id/cancel', protect, asyncHandler(cancelBooking));

export default router;
