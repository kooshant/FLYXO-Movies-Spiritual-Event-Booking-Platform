import { Router } from 'express';
import { addReview, getEventReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/:eventId', asyncHandler(getEventReviews));
router.post('/', protect, asyncHandler(addReview));

export default router;
