import { success, error } from '../utils/apiResponse.js';
import { validateCoupon } from '../services/couponService.js';
import prisma from '../config/db.js';

export const checkCoupon = async (req, res) => {
  const { code, amount } = req.body;
  if (!code) return error(res, 'Coupon code required', 400);

  const result = await validateCoupon(code, parseFloat(amount) || 0);
  if (!result.valid) return error(res, result.message, 400);

  return success(res, {
    code: result.coupon.code,
    discount: result.discount,
    description: result.coupon.description,
    finalAmount: Math.max(0, parseFloat(amount) - result.discount),
  });
};

export const getCoupons = async (req, res) => {
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    select: { code: true, description: true, discountPercent: true, discountAmount: true },
  });
  return success(res, coupons);
};
