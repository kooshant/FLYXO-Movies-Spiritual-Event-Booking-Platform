import prisma from '../config/db.js';

export const validateCoupon = async (code, orderAmount) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false, message: 'Invalid coupon code' };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, message: 'Coupon expired' };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  if (orderAmount < coupon.minOrderAmount) {
    return { valid: false, message: `Minimum order ₹${coupon.minOrderAmount}` };
  }

  let discount = 0;
  if (coupon.discountPercent) {
    discount = (orderAmount * coupon.discountPercent) / 100;
  } else if (coupon.discountAmount) {
    discount = coupon.discountAmount;
  }
  discount = Math.min(discount, orderAmount);

  return { valid: true, coupon, discount };
};

export const applyCouponUsage = async (code) => {
  await prisma.coupon.update({
    where: { code: code.toUpperCase().trim() },
    data: { usedCount: { increment: 1 } },
  });
};
