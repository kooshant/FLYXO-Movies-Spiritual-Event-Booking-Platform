import { Router } from 'express';
import { checkCoupon, getCoupons } from '../controllers/couponController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getCoupons));
router.post('/validate', asyncHandler(checkCoupon));

export default router;
