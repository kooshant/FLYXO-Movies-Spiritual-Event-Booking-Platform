import { Download } from 'lucide-react';

export default function QRTicket({ booking }) {
  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `FLYXO-${booking.bookingCode}.png`;
    link.href = booking.qrCode;
    link.click();
  };

  return (
    <div className="glass-card p-8 max-w-md mx-auto text-center">
      <div className="text-flyxo-primary font-display text-2xl font-bold mb-1">FLYXO</div>
      <p className="text-sm text-gray-500 mb-6">Digital Ticket</p>
      {booking.qrCode && (
        <img src={booking.qrCode} alt="QR Ticket" className="w-48 h-48 mx-auto rounded-xl bg-white p-2" />
      )}
      <p className="font-mono font-bold text-lg mt-4">{booking.bookingCode}</p>
      <p className="text-sm text-gray-500 mt-2">{booking.event?.title}</p>
      <div className="mt-4 text-sm space-y-1">
        {booking.seats?.map((s) => (
          <span key={s.label} className="inline-block bg-flyxo-primary/10 text-flyxo-primary px-3 py-1 rounded-full mr-2">
            Seat {s.label}
          </span>
        ))}
      </div>
      <button onClick={downloadQR} className="btn-primary mt-6 flex items-center gap-2 mx-auto">
        <Download size={18} /> Download Ticket
      </button>
    </div>
  );
}
