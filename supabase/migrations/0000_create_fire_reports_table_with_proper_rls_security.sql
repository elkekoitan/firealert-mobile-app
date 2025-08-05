-- Create fire_reports table
CREATE TABLE public.fire_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  ai_detected_elements TEXT[] DEFAULT '{}',
  ai_risk_level TEXT CHECK (ai_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  ai_is_likely_fire BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'FALSE_ALARM', 'RESOLVED')),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  emergency_112_notified BOOLEAN DEFAULT false,
  satellite_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fire_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all fire reports" ON public.fire_reports
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own fire reports" ON public.fire_reports
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fire reports" ON public.fire_reports
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fire reports" ON public.fire_reports
FOR DELETE TO authenticated USING (auth.uid() = user_id);