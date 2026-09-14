import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { authService } from '@/services/authService';
import { useAuthContext } from '@/context/AuthContext';

type Step = 'welcome' | 'otp' | 'success';

export default function Authentication() {
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Global authentication
  const { login } = useAuthContext();

  async function handleSendOtp() {
    if (!phone.trim()) {
      setError('Enter a mobile number to continue.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authService.sendOtp(phone.trim());

      if (response.sent) {
        setStep('otp');
      } else {
        setError('Unable to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        'Unable to connect to the SkillBridge server.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) {
      setError('Enter the OTP to continue.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { user, token } = await authService.verifyOtp(
        phone.trim(),
        otp.trim()
      );

      // Store REAL authenticated user and JWT globally
      login(user, token);

      setStep('success');
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    setError(
      'Google sign-in is not configured yet. Please continue using your mobile number.'
    );
  }

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-white rounded-card shadow-hover p-9">

      {step === 'welcome' && (
        <>
          <h2 className="font-serif text-2xl mb-1">
            Welcome to SkillBridge AI
          </h2>

          <p className="text-sm text-sb-textSoft mb-6">
            Sign in to discover your skill level and start your roadmap.
          </p>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 border border-sb-border rounded-xl py-3.5 text-sm font-semibold mb-4 hover:border-sb-blue transition-colors"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-sb-textSoft my-4">
            <span className="flex-1 h-px bg-sb-border" />
            or
            <span className="flex-1 h-px bg-sb-border" />
          </div>

          <input
            type="tel"
            className="w-full border border-sb-border rounded-xl px-4 py-3 text-sm mb-2 focus:outline-none focus:border-sb-blue"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error && (
            <p className="text-xs text-red-500 mb-2">
              {error}
            </p>
          )}

          <Button
            className="w-full mt-2"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>
        </>
      )}

      {step === 'otp' && (
        <>
          <h2 className="font-serif text-2xl mb-1">
            Enter the code
          </h2>

          <p className="text-sm text-sb-textSoft mb-6">
            Enter the verification code for {phone}.
          </p>

          <input
            inputMode="numeric"
            className="w-full border border-sb-border rounded-xl px-4 py-3 text-sm mb-2 focus:outline-none focus:border-sb-blue"
            placeholder="OTP code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {error && (
            <p className="text-xs text-red-500 mb-2">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & continue'}
          </Button>

          <button
            className="w-full text-sm text-sb-textSoft mt-4"
            onClick={() => {
              setStep('welcome');
              setOtp('');
              setError('');
            }}
          >
            Change mobile number
          </button>
        </>
      )}

      {step === 'success' && (
        <div className="text-center">

          <div className="w-14 h-14 rounded-full bg-sb-blue text-white flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>

          <h2 className="font-serif text-2xl mb-1">
            You're in
          </h2>

          <p className="text-sm text-sb-textSoft mb-6">
            Your account has been authenticated successfully. Let's discover your skill level.
          </p>

          <Button
            className="w-full"
            onClick={() => navigate('/career-paths')}
          >
            Discover my skill level →
          </Button>

        </div>
      )}

    </div>
  );
}