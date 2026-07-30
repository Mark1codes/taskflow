---
name: taskflow-secure-engineering
description: Secure engineering checklist for TaskFlow. Use when changing API routes, Supabase auth/storage/database access, AI assistant features, environment variables, deployment config, dependency versions, or any user-data flow. Apply OWASP-style validation, least privilege, rate limiting, secret handling, and production quality gates before finalizing changes.
---

# TaskFlow Secure Engineering

Use this skill as the default guardrail for TaskFlow code changes that touch data, auth, AI, APIs, storage, profile data, tasks, or deployment behavior.

## Core Workflow

1. Identify the trust boundary before editing:
   - Browser/client input.
   - Next.js API route.
   - Supabase Auth session.
   - Supabase table/storage policy.
   - Third-party API such as OpenRouter.

2. Prefer server-side enforcement for security rules:
   - Do not rely only on hidden UI buttons or client-side checks.
   - Validate ownership with Supabase Auth and RLS.
   - Re-check `user.id` on writes, deletes, uploads, and AI actions.

3. Keep fixes scoped:
   - Fix the vulnerable path directly.
   - Avoid broad rewrites unless the security control cannot be added safely.
   - Preserve existing user data and unrelated UI behavior.

4. Verify with commands proportional to risk:
   - Run TypeScript checks after code changes when feasible.
   - Run dependency audit for security review tasks.
   - Smoke-test high-risk flows such as login, task CRUD, profile upload, and AI chat.

## API Route Rules

- Require authentication for routes that spend money, access user data, modify state, or call third-party services.
- Validate request body shape, type, count, and max length before doing work.
- Return generic user-facing errors; log detailed provider/internal errors only on the server.
- Add rate limiting to expensive routes:
  - Prefer authenticated `user.id` as the primary key.
  - Fall back to IP only for unauthenticated public endpoints.
  - Use durable storage for production limits when serverless memory is not reliable.
- Add timeouts around third-party API calls.
- Never send server secrets, provider raw responses, stack traces, or internal config values to the browser.

## AI Assistant Rules

- Treat all chat messages and task-derived prompts as untrusted input.
- Do not expose `OPENROUTER_API_KEY` or any provider key to client code.
- Keep provider keys server-only; do not prefix them with `NEXT_PUBLIC_`.
- Limit message count and message length before forwarding to OpenRouter.
- Do not return OpenRouter raw error text to users.
- Ground task-aware AI responses only in task data the app intentionally sends.
- Do not invent private data access in prompts or UI copy.

## Supabase Rules

- Use RLS as the source of truth for row ownership.
- Policies must scope user-owned rows with `auth.uid()`.
- Avoid `anon` table access unless the route is intentionally public.
- Never grant `truncate` to `anon` or `authenticated`.
- Do not use a service-role key in browser code.
- For storage:
  - Keep the bucket name stable: `avatars`.
  - Store avatars under `{user.id}/filename`.
  - Require storage policies that only allow users to read/write their own folder.
  - Use signed URLs for private buckets.
  - Keep upload size and MIME type restricted.

## OWASP-Style Checks

Check these before finalizing security-sensitive changes:

- Broken access control: Can another user read, update, delete, upload, or analyze data they do not own?
- Cryptographic failures: Are secrets exposed in source, logs, browser bundles, or public env names?
- Injection: Are user strings used in SQL, prompts, URLs, HTML, or shell commands without safe APIs?
- Insecure design: Can a public endpoint spend money, exhaust quota, or modify state?
- Security misconfiguration: Are build errors ignored, auth settings weak, or database grants too broad?
- Vulnerable dependencies: Does `npm audit` show critical/high runtime vulnerabilities?
- Identification/auth failures: Are password, email confirmation, and account-change flows production-safe?
- Logging/monitoring: Are errors useful for developers without exposing sensitive internals to users?

## Environment And Secrets

- Keep `.env.local` local and untracked.
- Rotate any key that appears in command output, screenshots, commits, or chat.
- Store production secrets in Vercel Environment Variables.
- Use exact variable names from code.
- Keep private keys server-only:
  - Good: `OPENROUTER_API_KEY`.
  - Avoid: `NEXT_PUBLIC_OPENROUTER_API_KEY`.
- Only use `NEXT_PUBLIC_` for values safe to expose to every browser user.

## Dependency And Build Rules

- Treat critical/high `npm audit --omit=dev` findings as production blockers unless proven unreachable.
- Prefer upgrading vulnerable packages over suppressing advisories.
- Do not leave production builds with:
  - `ignoreBuildErrors: true`.
  - `ignoreDuringBuilds: true`.
- Fix existing TypeScript errors before enabling stricter production gates.

## TaskFlow Priority Backlog

When asked to harden TaskFlow, start from `SECURITY_PRIORITY_FIX_ORDER.md` and implement in order:

1. Protect `/api/ai-chat` with Supabase auth.
2. Remove provider error leakage.
3. Update vulnerable dependencies.
4. Rotate exposed API keys.
5. Tighten Supabase permissions and storage policies.
6. Harden auth settings.
7. Review avatar signed URL lifetime.
8. Re-enable production quality gates.

## Final Response Expectations

When this skill affects a change, report:

- What security boundary was hardened.
- What files changed.
- What was verified.
- Any remaining risk or production setting the user must update outside the repo.
