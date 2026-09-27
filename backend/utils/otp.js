import crypto from 'crypto';

export const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

export const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
