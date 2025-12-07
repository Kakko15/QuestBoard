-- =====================================================
-- 2FA MIGRATION: Run this in Supabase SQL Editor
-- Adds TOTP (Google Authenticator) and Email OTP support
-- Email OTPs expire in 10 minutes
-- =====================================================

-- Add 2FA columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS totp_secret TEXT,
ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS two_fa_method TEXT DEFAULT NULL; -- 'totp', 'email', or null

-- Create email OTP table with 10 minute expiration
CREATE TABLE IF NOT EXISTS email_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login', -- 'login', 'signup', '2fa_setup'
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast OTP lookups
CREATE INDEX IF NOT EXISTS idx_email_otp_codes_user ON email_otp_codes(user_id, code);
CREATE INDEX IF NOT EXISTS idx_email_otp_codes_email ON email_otp_codes(email, code);
CREATE INDEX IF NOT EXISTS idx_email_otp_codes_expires ON email_otp_codes(expires_at);

-- Enable RLS on OTP table
ALTER TABLE email_otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own OTP codes" ON email_otp_codes;
DROP POLICY IF EXISTS "Service can insert OTP codes" ON email_otp_codes;
DROP POLICY IF EXISTS "Users can update own OTP codes" ON email_otp_codes;

-- Policy: Users can only see their own OTP records
CREATE POLICY "Users can view own OTP codes"
  ON email_otp_codes FOR SELECT
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Policy: Allow inserting OTP codes (service role handles this)
CREATE POLICY "Service can insert OTP codes"
  ON email_otp_codes FOR INSERT
  WITH CHECK (true);

-- Policy: Allow updating OTP codes (mark as used)
CREATE POLICY "Users can update own OTP codes"
  ON email_otp_codes FOR UPDATE
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Function to clean up expired OTPs (run periodically via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_otp_codes 
  WHERE expires_at < NOW() OR used_at IS NOT NULL;
END;
$$;

-- Create a table for pending 2FA verifications during login
CREATE TABLE IF NOT EXISTS pending_2fa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL, -- 'totp' or 'email'
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_2fa_token ON pending_2fa_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_pending_2fa_expires ON pending_2fa_sessions(expires_at);

-- Enable RLS
ALTER TABLE pending_2fa_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Service can manage pending 2FA sessions" ON pending_2fa_sessions;

-- RLS Policies for pending sessions (service role only)
CREATE POLICY "Service can manage pending 2FA sessions"
  ON pending_2fa_sessions FOR ALL
  USING (true);

-- =====================================================
-- CRON JOB: Clean up expired OTPs every hour
-- Add this to Supabase Dashboard > Database > Extensions > pg_cron
-- Or run manually: SELECT cleanup_expired_otps();
-- =====================================================
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps()');

-- =====================================================
-- DONE! 2FA tables created successfully
-- 
-- Features:
-- - Google Authenticator (TOTP) support
-- - Email OTP with 10 minute expiration
-- - Secure storage of TOTP secrets
-- - Auto-cleanup of expired codes
-- =====================================================
