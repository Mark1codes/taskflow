# Security Priority Fix Order

Use this as the implementation checklist for the next security hardening pass.

## 1. Protect the AI API route

- Require a valid Supabase authenticated session before `/api/ai-chat` calls OpenRouter.
- Rate-limit by authenticated `user.id`, not only by IP address.
- Add a strict request body limit and validate message shape/length.

## 2. Remove provider error leakage

- Keep OpenRouter raw error details in server logs only.
- Return a generic user-facing error from `/api/ai-chat`.
- Avoid exposing provider quota, account, model, or internal response details to the browser.

## 3. Update vulnerable dependencies

- Run `npm audit fix`.
- Rebuild and smoke-test the app after dependency updates.
- Pay close attention to Next.js, sharp, postcss, lodash, and ws advisories.

## 4. Rotate exposed API keys

- Rotate the OpenRouter API key.
- Update the new key in `.env.local` for local development.
- Update the same key in Vercel Environment Variables for production.
- Never commit `.env.local` or print the key in logs/output.

## 5. Tighten Supabase permissions and policies

- Remove unnecessary `truncate` grants from `anon` and `authenticated` roles.
- Avoid table privileges for `anon` unless absolutely needed.
- Keep RLS policies scoped to `auth.uid()`.
- Confirm `avatars` bucket policies only allow users to read/write their own folder.

## 6. Harden auth settings

- Increase minimum password length to at least 8 characters.
- Enable email confirmation for production.
- Require recent login or secure password change for sensitive account updates.
- Consider MFA later if the app handles sensitive work data.

## 7. Review avatar signed URL lifetime

- Current signed avatar URLs last 30 days.
- Decide whether profile images should use shorter signed URLs, such as 1 hour or 24 hours.
- If the bucket is public by design, document that choice clearly.

## 8. Re-enable production quality gates

- Stop ignoring TypeScript build errors in production.
- Stop ignoring ESLint errors in production.
- Fix existing type issues before enabling strict deployment gates.
