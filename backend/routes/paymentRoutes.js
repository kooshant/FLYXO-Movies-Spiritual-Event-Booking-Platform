import { Router } from 'express';
import {
  getPaymentConfig,
  verifyBookingPayment,
  verifyDonationPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/config', asyncHandler(getPaymentConfig));
router.post('/verify-booking', protect, asyncHandler(verifyBookingPayment));
router.post('/verify-donation', protect, asyncHandler(verifyDonationPayment));

export default router;
