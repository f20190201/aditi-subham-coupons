
REVOKE EXECUTE ON FUNCTION public.is_whitelisted() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_whitelisted() TO authenticated;
