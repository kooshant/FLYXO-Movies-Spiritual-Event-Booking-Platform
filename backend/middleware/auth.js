import { verifyToken } from '../utils/generateToken.js';
import prisma from '../config/db.js';
import { error } from '../utils/apiResponse.js';
import { asyncHandler } from './asyncHandler.js';

/** Protect routes — requires valid JWT */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return error(res, 'Not authorized. Please login.', 401);

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return error(res, 'Invalid or expired token.', 401);
  }

  const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        organizer: true,
      },
    });

    if (!user || !user.isActive) {
      return error(res, 'User not found or deactivated.', 401);
    }

    req.user = user;
    next();
});

/** Role-based authorization */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, `Role ${req.user.role} is not authorized.`, 403);
    }
    next();
  };
};
