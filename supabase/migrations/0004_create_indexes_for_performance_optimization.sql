-- Indexes for fire_reports
CREATE INDEX idx_fire_reports_user_id ON public.fire_reports(user_id);
CREATE INDEX idx_fire_reports_status ON public.fire_reports(status);
CREATE INDEX idx_fire_reports_created_at ON public.fire_reports(created_at DESC);
CREATE INDEX idx_fire_reports_location ON public.fire_reports(latitude, longitude);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Indexes for profiles
CREATE INDEX idx_profiles_reliability_score ON public.profiles(reliability_score DESC);