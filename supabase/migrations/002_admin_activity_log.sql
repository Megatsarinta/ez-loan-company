-- Admin activity log for user management actions (wallet, code, ban, personal info, bank info)
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT REFERENCES public.admin(id) ON DELETE SET NULL,
  admin_username VARCHAR(255) NOT NULL,
  admin_role VARCHAR(50) NOT NULL,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user ON public.admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON public.admin_activity_log(created_at DESC);

COMMENT ON TABLE public.admin_activity_log IS 'Log of admin actions on users (wallet update, code, ban, personal/bank info)';
