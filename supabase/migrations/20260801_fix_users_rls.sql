-- Fix: allow authenticated users to read ALL user profiles (needed for assignee dropdown)
DROP POLICY IF EXISTS "user_select" ON "public"."users";

CREATE POLICY "users_read_all_authenticated"
ON "public"."users"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);
