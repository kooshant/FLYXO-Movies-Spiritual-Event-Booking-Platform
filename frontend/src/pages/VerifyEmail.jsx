import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('missing');
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success('Email verified!');
      })
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
      <div className="glass-card max-w-md p-8">
        {status === 'loading' && <p>Verifying your email...</p>}
        {status === 'success' && (
          <>
            <span className="text-5xl">✅</span>
            <h1 className="section-title mt-4 text-emerald-500">Email Verified!</h1>
            <Link to="/" className="btn-primary inline-block mt-6">Go Home</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-red-400 font-bold">Verification failed</h1>
            <p className="text-sm text-gray-500 mt-2">Link expired or invalid</p>
            <Link to="/profile" className="btn-outline inline-block mt-6">Resend from Profile</Link>
          </>
        )}
        {status === 'missing' && <p>Invalid verification link</p>}
      </div>
    </div>
  );
}
