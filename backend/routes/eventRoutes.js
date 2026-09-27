import { Router } from 'express';
import {
  getEvents,
  getEventById,
  getTrending,
  getUpcomingSpiritual,
  getMovieRecommendations,
  getNearbyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  approveEvent,
  getPendingEvents,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getEvents));
router.get('/trending', asyncHandler(getTrending));
router.get('/spiritual', asyncHandler(getUpcomingSpiritual));
router.get('/movies', asyncHandler(getMovieRecommendations));
router.get('/nearby', asyncHandler(getNearbyEvents));
router.get('/organizer/mine', protect, authorize('ORGANIZER'), asyncHandler(getOrganizerEvents));
router.get('/admin/pending', protect, authorize('ADMIN'), asyncHandler(getPendingEvents));

router.get('/:id', asyncHandler(getEventById));
router.post('/', protect, authorize('ORGANIZER', 'ADMIN'), upload.single('banner'), asyncHandler(createEvent));
router.put('/:id', protect, authorize('ORGANIZER', 'ADMIN'), upload.single('banner'), asyncHandler(updateEvent));
router.delete('/:id', protect, authorize('ORGANIZER', 'ADMIN'), asyncHandler(deleteEvent));
router.patch('/:id/status', protect, authorize('ADMIN'), asyncHandler(approveEvent));

export default router;
