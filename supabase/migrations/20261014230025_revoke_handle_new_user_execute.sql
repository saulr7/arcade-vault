-- The trigger fires regardless of EXECUTE grants; this only closes the /rest/v1/rpc/handle_new_user endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
