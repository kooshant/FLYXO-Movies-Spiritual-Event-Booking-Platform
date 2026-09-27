import QRCode from 'qrcode';

/** Generate QR code data URL for booking ticket */
export const generateTicketQR = async (booking) => {
  const payload = JSON.stringify({
    code: booking.bookingCode,
    id: booking.id,
    eventId: booking.eventId,
    userId: booking.userId,
    seats: booking.seats?.map((s) => s.label) || [],
    amount: booking.totalAmount,
    ts: Date.now(),
  });

  return QRCode.toDataURL(payload, {
    width: 300,
    margin: 2,
    color: { dark: '#1e1b4b', light: '#ffffff' },
  });
};
