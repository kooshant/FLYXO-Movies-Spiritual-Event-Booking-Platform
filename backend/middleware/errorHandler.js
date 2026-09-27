import { error } from '../utils/apiResponse.js';

/** Global error handler */
export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);

  if (err.code === 'P1000' || err.code === 'P1001') {
    return error(res, 'Database connection failed. Check DATABASE_URL in backend/.env', 503);
  }
  if (err.code === 'P2021' || err.message?.includes('does not exist')) {
    return error(res, 'Database tables missing. Run: npx prisma db push', 503);
  }
  if (err.code === 'P2002') {
    return error(res, 'Duplicate entry. Record already exists.', 400);
  }
  if (err.code === 'P2025') {
    return error(res, 'Record not found.', 404);
  }
  if (err.name === 'ValidationError') {
    return error(res, err.message, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token.', 401);
  }

  return error(res, err.message || 'Internal server error', err.statusCode || 500);
};
