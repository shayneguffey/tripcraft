-- =============================================
-- FIX: Infinite recursion in RLS policies
-- The issue: trips policies query trip_collaborators,
-- and trip_collaborators policies query trips = loop
-- Solution: Break the cycle by simplifying trip_collaborators
-- policies to NOT reference the trips table
-- =============================================

-- 1. Fix trip_collaborators policies (remove trips references)
DROP POLICY IF EXISTS "Trip members can view collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Trip members can invite collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Users can update own invites" ON trip_collaborators;
DROP POLICY IF EXISTS "Trip owner can delete collaborators" ON trip_collaborators;

-- View: you can see collaborator rows where you're involved
CREATE POLICY "Users can view collaborators"
  ON trip_collaborators FOR SELECT
  USING (
    user_id = auth.uid()
    OR invited_by = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Insert: use SECURITY DEFINER function (bypasses RLS, no recursion)
CREATE POLICY "Authorized users can invite"
  ON trip_collaborators FOR INSERT
  WITH CHECK (
    user_has_trip_access(trip_id)
  );

-- Update: you can update invites sent to you or that you sent
CREATE POLICY "Users can update invites"
  ON trip_collaborators FOR UPDATE
  USING (
    user_id = auth.uid()
    OR invited_by = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Delete: you can remove invites you sent, or leave a trip yourself
CREATE POLICY "Users can delete collaborators"
  ON trip_collaborators FOR DELETE
  USING (
    user_id = auth.uid()
    OR invited_by = auth.uid()
  );
