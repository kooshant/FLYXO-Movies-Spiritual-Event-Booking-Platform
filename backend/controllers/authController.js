import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';
import { success, error } from '../utils/apiResponse.js';
import { generateSecureToken, generateOTP } from '../utils/otp.js';
import { sendVerificationEmail, sendPasswordResetOTP } from '../services/emailService.js';

export const register = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password, name, phone, role } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return error(res, 'Email already registered', 400);

  const hashed = await bcrypt.hash(password, 12);
  const userRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
  const verifyToken = generateSecureToken();
  const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      phone,
      role: userRole,
      emailVerified: false,
      verifyToken,
      verifyTokenExp,
    },
    select: { id: true, email: true, name: true, role: true, phone: true, emailVerified: true },
  });

  if (userRole === 'ORGANIZER') {
    await prisma.organizer.create({
      data: { userId: user.id, orgName: `${name}'s Events` },
    });
  }

  const verifyLink = await sendVerificationEmail(user, verifyToken);
  const token = generateToken(user.id, user.role);

  return success(
    res,
    {
      user,
      token,
      verifyLink: process.env.NODE_ENV !== 'production' ? verifyLink : undefined,
      message: 'Check your email to verify account',
    },
    'Registration successful. Please verify your email.',
    201
  );
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  const user = await prisma.user.findFirst({
    where: { verifyToken: token, verifyTokenExp: { gt: new Date() } },
  });
  if (!user) return error(res, 'Invalid or expired verification link', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
  });
  return success(res, null, 'Email verified successfully!');
};

export const forgotPassword = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return success(res, null, 'If email exists, OTP has been sent');

  const otp = generateOTP();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: otp,
      resetTokenExp: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  await sendPasswordResetOTP(user, otp);

  const devOtp = process.env.NODE_ENV !== 'production' ? otp : undefined;
  return success(res, { devOtp }, 'OTP sent to your email');
};

export const resetPassword = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { otp, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: { email, resetToken: otp, resetTokenExp: { gt: new Date() } },
  });
  if (!user) return error(res, 'Invalid or expired OTP', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 12),
      resetToken: null,
      resetTokenExp: null,
    },
  });
  return success(res, null, 'Password reset successful. Please login.');
};

export const resendVerification = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return error(res, 'User not found', 404);
  if (user.emailVerified) return success(res, null, 'Already verified');

  const verifyToken = generateSecureToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken, verifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });
  const link = await sendVerificationEmail(user, verifyToken);
  return success(res, { verifyLink: process.env.NODE_ENV !== 'production' ? link : undefined }, 'Verification email sent');
};

export const login = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organizer: true },
  });

  if (!user || !user.isActive) return error(res, 'Invalid credentials', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) return error(res, 'Invalid credentials', 401);

  const token = generateToken(user.id, user.role);
  const { password: _, ...safeUser } = user;

  return success(res, { user: safeUser, token }, 'Login successful');
};

export const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      organizer: true,
      _count: { select: { bookings: true, wishlist: true } },
    },
  });
  return success(res, user);
};

export const updateProfile = async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) },
    select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, emailVerified: true },
  });
  return success(res, user, 'Profile updated');
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return error(res, 'Current password is incorrect', 400);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  });

  return success(res, null, 'Password changed successfully');
};
