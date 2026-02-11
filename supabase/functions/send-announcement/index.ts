import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AnnouncementRequest {
  title: string;
  description: string;
  type: string;
  target_user_id?: string;
  is_pinned?: boolean;
  department?: string[];
  pin_till?: string;
  imageUrl?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json() as AnnouncementRequest;

    // Validate required fields
    if (!requestBody.title || !requestBody.description) {
      return new Response(
        JSON.stringify({ error: 'Title and description are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // If targeting a specific student, create notification for that user
    if (requestBody.target_user_id) {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: requestBody.title,
          body: requestBody.description,
          type: requestBody.type || 'announcement',
          target_user_id: requestBody.target_user_id,
          is_pinned: requestBody.is_pinned || false,
          pin_till: requestBody.pin_till || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating notification for student:', error)
        throw error
      }

      console.log('Announcement sent to student:', requestBody.target_user_id)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Announcement sent successfully',
          notification: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If targeting department(s), get all users in that department and create notifications
    if (requestBody.department && requestBody.department.length > 0) {
      // Map department codes back to display names for querying
      const deptCodeToDisplay: Record<string, string> = {
        'computer_science': 'B.Sc (COMPUTER SCIENCE)',
        'information_technology': 'B C A',
        'commerce': 'B.COM',
        'psychology': 'B.Sc (PSYCHOLOGY)',
        'management': 'B B A',
        'all': ''
      }

      let deptFilter = requestBody.department
      if (requestBody.department.includes('all')) {
        // Skip department filter if 'all' is selected
        deptFilter = []
      }

      // Get users from the department
      let query = supabase
        .from('users')
        .select('id')
        .eq('status', 'active')

      if (deptFilter.length > 0) {
        const deptNames = deptFilter.map(code => deptCodeToDisplay[code]).filter(Boolean)
        if (deptNames.length > 0) {
          query = query.in('department', deptNames)
        }
      }

      const { data: users, error: usersError } = await query

      if (usersError) {
        console.error('Error fetching users:', usersError)
        throw usersError
      }

      if (!users || users.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No users found in the selected department'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create notifications for all users
      const notifications = users.map(user => ({
        title: requestBody.title,
        body: requestBody.description,
        type: requestBody.type || 'announcement',
        target_user_id: user.id,
        is_pinned: requestBody.is_pinned || false,
        pin_till: requestBody.pin_till || null,
        created_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) {
        console.error('Error creating notifications:', error)
        throw error
      }

      console.log(`Announcement sent to ${users.length} students`)
      return new Response(
        JSON.stringify({
          success: true,
          message: `Announcement sent to ${users.length} students`,
          count: users.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Either target_user_id or department must be provided' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
