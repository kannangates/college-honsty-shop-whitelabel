
-- Allow users to insert their own notification read records
CREATE POLICY "Users can insert own notification reads"
  ON public.notification_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own notification read records
CREATE POLICY "Users can update own notification reads"
  ON public.notification_reads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
