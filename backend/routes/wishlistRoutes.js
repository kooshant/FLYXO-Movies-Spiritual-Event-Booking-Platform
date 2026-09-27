import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(protect);
router.get('/', asyncHandler(getWishlist));
router.post('/', asyncHandler(addToWishlist));
router.get('/check/:eventId', asyncHandler(checkWishlist));
router.delete('/:eventId', asyncHandler(removeFromWishlist));

export default router;
