import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface AuditLogParams {
  supabase: SupabaseClient;
  userId: string;
  userRole: string;
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin access to sensitive data in the admin_audit_log table
 */
export async function logAdminAction(params: AuditLogParams): Promise<void> {
  const {
    supabase,
    userId,
    userRole,
    action,
    tableName,
    recordId,
    oldValues,
    newValues,
    ipAddress,
    userAgent
  } = params;

  try {
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        user_id: userId,
        user_role: userRole,
        action,
        table_name: tableName,
        record_id: recordId || null,
        old_values: oldValues || null,
        new_values: newValues || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  } catch (err) {
    console.error('Audit logging error:', err);
    // Don't throw - audit logging failure shouldn't break the main operation
  }
}
