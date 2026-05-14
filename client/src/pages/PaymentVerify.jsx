import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentApi } from '../api';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus]   = useState('loading');

  useEffect(() => {
    const txnId = searchParams.get('txnId');
    if (!txnId) { setStatus('error'); return; }
    paymentApi.verify(txnId)
      .then(({ data }) => setStatus(data.success ? 'success' : 'failed'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="card p-10 text-center max-w-sm w-full animate-scale-in">
        {status === 'loading' && (
          <>
            <Loader2 size={56} className="mx-auto mb-4 text-primary-500 animate-spin" />
            <h2 className="font-extrabold text-ink text-xl">Verifying payment…</h2>
            <p className="text-ink-muted text-sm mt-1">Please wait, do not close this tab.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={64} className="mx-auto mb-4 text-emerald-500" />
            <h2 className="font-extrabold text-ink text-2xl mb-2">Payment Successful!</h2>
            <p className="text-ink-muted text-sm mb-6">You're enrolled! Start learning right now.</p>
            <Link to="/dashboard" className="btn btn-primary btn-lg w-full justify-center">Go to Dashboard</Link>
          </>
        )}
        {(status === 'failed' || status === 'error') && (
          <>
            <XCircle size={64} className="mx-auto mb-4 text-red-500" />
            <h2 className="font-extrabold text-ink text-2xl mb-2">Payment Failed</h2>
            <p className="text-ink-muted text-sm mb-6">Your transaction could not be completed. No charges were made.</p>
            <Link to="/courses" className="btn btn-primary btn-lg w-full justify-center">Browse Courses</Link>
          </>
        )}
      </div>
    </div>
  );
}
