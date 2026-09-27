import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { paymentService } from '../services/paymentService';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Open Razorpay checkout
 * @param {Object} opts
 * @param {Object} opts.order - { id, amount, currency, key? }
 * @param {string} opts.bookingId - for ticket booking
 * @param {string} opts.paymentId - for donations
 * @param {Object} opts.user - { name, email, phone } prefill
 * @param {string} opts.description
 * @param {Function} opts.onSuccess
 * @param {Function} opts.onFailure
 */
export const useRazorpay = () => {
  const openPayment = useCallback(
    async ({
      order,
      bookingId,
      paymentId,
      user,
      description = 'FLYXO Payment',
      onSuccess,
      onFailure,
    }) => {
      if (!window.Razorpay) {
        toast.error('Razorpay script not loaded. Check internet connection.');
        onFailure?.();
        return;
      }

      let key = RAZORPAY_KEY || order?.key;
      if (!key || key.includes('placeholder')) {
        try {
          const cfg = await paymentService.getConfig();
          key = cfg.data?.keyId;
        } catch {
          toast.error('Razorpay keys missing. Add VITE_RAZORPAY_KEY_ID in frontend/.env');
          onFailure?.();
          return;
        }
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'FLYXO',
        description,
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#e11d48' },
        handler: async (response) => {
          try {
            const payload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
              paymentId,
            };

            if (bookingId) {
              const res = await paymentService.verifyBooking(payload);
              await onSuccess?.(res.data, payload);
            } else if (paymentId) {
              const res = await paymentService.verifyDonation(payload);
              await onSuccess?.(res.data, payload);
            } else {
              await onSuccess?.(payload, payload);
            }
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
            onFailure?.();
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            onFailure?.();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(resp.error?.description || 'Payment failed');
        onFailure?.();
      });
      rzp.open();
    },
    []
  );

  return { openPayment };
};
