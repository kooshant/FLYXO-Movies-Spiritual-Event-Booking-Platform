import nodemailer from 'nodemailer';

const hasSmtp = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasSmtp()
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const send = async (to, subject, html) => {
  if (!transporter) {
    console.log(`[Email skipped — no SMTP] To: ${to} | ${subject}`);
    return false;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FLYXO <noreply@flyxo.com>',
    to,
    subject,
    html,
  });
  return true;
};

/** Dev helper — log sensitive codes when SMTP off */
export const logDevAuth = (label, data) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📧 [DEV ${label}]`, data, '\n');
  }
};

export const sendBookingConfirmation = async (user, booking, event) => {
  const html = `
    <h1 style="color:#e11d48">FLYXO — Booking Confirmed</h1>
    <p>Hi ${user.name},</p>
    <p><strong>${event.title}</strong></p>
    <p>Code: <b>${booking.bookingCode}</b></p>
    <p>₹${booking.totalAmount} | ${event.venue}</p>
  `;
  await send(user.email, `Booking Confirmed — ${event.title}`, html);
};

export const sendVerificationEmail = async (user, token) => {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const html = `
    <h1>Verify your FLYXO account</h1>
    <p>Hi ${user.name}, click below to verify:</p>
    <a href="${link}">${link}</a>
  `;
  logDevAuth('VERIFY EMAIL', { email: user.email, link });
  await send(user.email, 'Verify your FLYXO account', html);
  return link;
};

export const sendPasswordResetOTP = async (user, otp) => {
  const html = `
    <h1>FLYXO — Password Reset</h1>
    <p>Hi ${user.name}, your OTP is:</p>
    <h2 style="letter-spacing:8px">${otp}</h2>
    <p>Valid for 15 minutes. Do not share.</p>
  `;
  logDevAuth('RESET OTP', { email: user.email, otp });
  await send(user.email, 'FLYXO Password Reset OTP', html);
};

export const sendEventReminder = async (user, event) => {
  await send(user.email, `Reminder: ${event.title}`, `<p>Hi ${user.name}, ${event.title} is tomorrow!</p>`);
};
