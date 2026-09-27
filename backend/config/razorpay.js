import Razorpay from 'razorpay';

let instance = null;

/** Lazy-init Razorpay (invalid keys won't crash server on startup) */
export const getRazorpay = () => {
  if (!instance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys missing in backend/.env');
    }
    if (process.env.RAZORPAY_KEY_ID.includes('placeholder')) {
      throw new Error('Set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
    }
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};

export default getRazorpay;
