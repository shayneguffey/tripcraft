# TripCraft — Production Deployment Checklist

## Supabase Configuration

- [ ] Set **Site URL** to your production domain (Authentication → URL Configuration)
- [ ] Add production redirect URLs (Authentication → URL Configuration):
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/auth/reset-password`
- [ ] Update **Reset Password** email template with TripCraft branding (Authentication → Email Templates)
- [ ] Review rate limits for auth endpoints (Authentication → Rate Limits)
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Review and restrict Supabase API keys — ensure anon key has minimal permissions

## Google OAuth

- [ ] Add production domain to **Authorized redirect URIs** in Google Cloud Console
- [ ] Add production domain to **Authorized JavaScript origins** in Google Cloud Console
- [ ] Update **OAuth consent screen** — set App name to "TripCraft", upload logo, add authorized domains
- [ ] Submit OAuth consent screen for verification (required to remove "unverified app" warning for external users)

## Vercel / Hosting

- [ ] Set environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verify production build succeeds (`npm run build`)
- [ ] Set up custom domain and configure DNS
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure redirect from www to non-www (or vice versa)

## Performance & Assets

- [ ] Optimize the earth-posterized.png texture (currently ~4.8MB — compress or resize)
- [ ] Verify Three.js CDN loads reliably in production
- [ ] Test page load times on mobile and slow connections
- [ ] Confirm globe animation performs well on lower-end devices

## Security

- [ ] Remove any development-only console.log statements
- [ ] Ensure no API keys or secrets are exposed in client-side code
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Test that unauthenticated users cannot access `/trips` or other protected routes

## Testing

- [ ] Test full sign-up flow (email + Google OAuth)
- [ ] Test full login flow (email + Google OAuth)
- [ ] Test forgot password → reset password flow end to end
- [ ] Test in incognito mode (dark mode / color scheme fix)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Test popup Google sign-in — verify popup closes after auth and fallback redirect works if blocked

## Custom Domain (Future)

- [ ] Set up Supabase custom domain to replace `wywwksawbdjyjnccsqte.supabase.co` in Google sign-in
- [ ] Update Google OAuth redirect URIs to use custom Supabase domain
