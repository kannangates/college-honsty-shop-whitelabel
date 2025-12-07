-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Users cannot update orders after creation" ON public.orders;

-- Create a new policy that allows users to update payment status on their own unpaid orders
CREATE POLICY "Users can update payment on their unpaid orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id AND payment_status = 'unpaid')
WITH CHECK (auth.uid() = user_id);