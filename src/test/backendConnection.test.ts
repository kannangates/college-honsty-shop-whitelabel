import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Supabase backend connection', () => {
  it('should connect and fetch from a public table', async () => {
    // Try to fetch from a public table, e.g., 'products' or 'users'. Adjust table name as needed.
    const { data, error } = await supabase.from('users').select('*').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
}); 