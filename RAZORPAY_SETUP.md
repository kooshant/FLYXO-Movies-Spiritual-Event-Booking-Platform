# FLYXO — Razorpay Payment Setup

## 1. Razorpay account

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Sign up / Login
3. **Test Mode** ON rakho (development ke liye)

## 2. API Keys copy karo

Dashboard → **Account & Settings** → **API Keys** → **Generate Test Key**

| Key | Kahan paste |
|-----|-------------|
| **Key ID** (`rzp_test_...`) | `backend/.env` → `RAZORPAY_KEY_ID` |
| **Key ID** | `frontend/.env` → `VITE_RAZORPAY_KEY_ID` |
| **Key Secret** | `backend/.env` → `RAZORPAY_KEY_SECRET` (sirf backend, kabhi frontend mat daalo) |

### backend/.env
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

### frontend/.env
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

## 3. Servers restart

```bash
cd backend
npm run dev

cd frontend
npm run dev
```

## 4. Test payment

### Ticket booking
1. Login as `user@flyxo.com` / `user123`
2. Koi **paid** event kholo (e.g. Pushpa 2 — ₹350)
3. **Book Tickets** → seat select → **Pay with Razorpay**

### Donation
1. **Donate** page → amount → **Donate**

### Razorpay test card
| Field | Value |
|-------|--------|
| Card | `4111 1111 1111 1111` |
| Expiry | koi bhi future date |
| CVV | `123` |
| OTP | `1234` |

### Test UPI
`success@razorpay` — payment success  
`failure@razorpay` — payment fail

## 5. Payment flow (technical)

```
User clicks Pay
    → POST /api/bookings/order (creates Razorpay order)
    → Razorpay popup opens
    → User pays
    → POST /api/payments/verify-booking (signature verify)
    → Booking CONFIRMED + QR ticket
```

Donation: `POST /api/bookings/donate` → popup → `POST /api/payments/verify-donation`

## 6. Production

1. Razorpay dashboard → **Live Mode**
2. Live API keys `.env` mein daalo
3. HTTPS domain required for live payments

## Troubleshooting

| Error | Fix |
|-------|-----|
| Razorpay keys missing | `.env` mein real `rzp_test_` keys |
| Payment verification failed | Backend `RAZORPAY_KEY_SECRET` galat hai |
| Payment gateway error | Test mode keys + internet check |
