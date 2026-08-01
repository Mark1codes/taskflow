-- ============================================================
-- Fix RLS Policy Name Collision
-- Run this in: Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Drop existing policies
DROP POLICY IF EXISTS "task_select" ON public.task;
DROP POLICY IF EXISTS "task_update" ON public.task;

-- 2. Create the unified task SELECT policy
-- We MUST explicitly use `task.id` because `task_assignees` also has an `id` column.
-- Otherwise, Postgres thinks we are comparing `task_assignees.task_id = task_assignees.id`, which is false!
CREATE POLICY "task_select" 
ON public.task 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.task_assignees 
    WHERE task_assignees.task_id = task.id 
    AND task_assignees.user_id = auth.uid()
  )
);

-- 3. Create task UPDATE policy
CREATE POLICY "task_update" 
ON public.task 
FOR UPDATE 
TO authenticated 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.task_assignees 
    WHERE task_assignees.task_id = task.id 
    AND task_assignees.user_id = auth.uid()
  )
);
