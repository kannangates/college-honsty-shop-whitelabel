
-- Create table to track ranking streaks for events
CREATE TABLE IF NOT EXISTS public.ranking_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('student', 'department')),
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  rank_position INTEGER NOT NULL,
  streak_start_date DATE NOT NULL,
  streak_end_date DATE,
  streak_length_days INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN streak_end_date IS NULL THEN EXTRACT(DAY FROM NOW() - streak_start_date)::INTEGER
      ELSE EXTRACT(DAY FROM streak_end_date - streak_start_date)::INTEGER
    END
  ) STORED,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update ranking streaks
CREATE OR REPLACE FUNCTION update_ranking_streaks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update student streaks
  WITH current_top_students AS (
    SELECT student_id, name, rank, 
           LAG(rank) OVER (PARTITION BY student_id ORDER BY updated_at) as prev_rank
    FROM public.top_students 
    WHERE is_archived = FALSE AND rank <= 3
  ),
  streak_updates AS (
    SELECT 
      'student' as entity_type,
      student_id as entity_id,
      name as entity_name,
      rank as rank_position,
      CURRENT_DATE as current_date
    FROM current_top_students
  )
  -- Insert new streaks or continue existing ones
  INSERT INTO public.ranking_streaks (entity_type, entity_id, entity_name, rank_position, streak_start_date)
  SELECT entity_type, entity_id, entity_name, rank_position, current_date
  FROM streak_updates s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ranking_streaks rs
    WHERE rs.entity_type = s.entity_type 
    AND rs.entity_id = s.entity_id 
    AND rs.rank_position = s.rank_position
    AND rs.is_active = TRUE
  );

  -- End streaks for entities no longer in top positions
  UPDATE public.ranking_streaks
  SET is_active = FALSE, streak_end_date = CURRENT_DATE, updated_at = NOW()
  WHERE is_active = TRUE
  AND entity_type = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM public.top_students ts
    WHERE ts.student_id = ranking_streaks.entity_id
    AND ts.rank = ranking_streaks.rank_position
    AND ts.is_archived = FALSE
  );

  -- Update department streaks
  WITH current_top_departments AS (
    SELECT department, rank
    FROM public.top_departments 
    WHERE is_archived = FALSE AND rank <= 3
  ),
  dept_streak_updates AS (
    SELECT 
      'department' as entity_type,
      department as entity_id,
      department as entity_name,
      rank as rank_position,
      CURRENT_DATE as current_date
    FROM current_top_departments
  )
  INSERT INTO public.ranking_streaks (entity_type, entity_id, entity_name, rank_position, streak_start_date)
  SELECT entity_type, entity_id, entity_name, rank_position, current_date
  FROM dept_streak_updates d
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ranking_streaks rs
    WHERE rs.entity_type = d.entity_type 
    AND rs.entity_id = d.entity_id 
    AND rs.rank_position = d.rank_position
    AND rs.is_active = TRUE
  );

  -- End department streaks
  UPDATE public.ranking_streaks
  SET is_active = FALSE, streak_end_date = CURRENT_DATE, updated_at = NOW()
  WHERE is_active = TRUE
  AND entity_type = 'department'
  AND NOT EXISTS (
    SELECT 1 FROM public.top_departments td
    WHERE td.department = ranking_streaks.entity_id
    AND td.rank = ranking_streaks.rank_position
    AND td.is_archived = FALSE
  );
END;
$$;

-- Function to get entities with streaks of specific duration
CREATE OR REPLACE FUNCTION get_streak_achievers(
  streak_days INTEGER,
  entity_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  entity_type TEXT,
  entity_id TEXT,
  entity_name TEXT,
  rank_position INTEGER,
  streak_length INTEGER,
  streak_start DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.entity_type,
    rs.entity_id,
    rs.entity_name,
    rs.rank_position,
    rs.streak_length_days,
    rs.streak_start_date
  FROM public.ranking_streaks rs
  WHERE rs.is_active = TRUE
  AND rs.streak_length_days >= streak_days
  AND (entity_filter IS NULL OR rs.entity_type = entity_filter)
  ORDER BY rs.streak_length_days DESC, rs.rank_position ASC;
END;
$$;

-- Enable RLS
ALTER TABLE public.ranking_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to ranking streaks" 
ON public.ranking_streaks 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admins full access to ranking streaks" 
ON public.ranking_streaks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
