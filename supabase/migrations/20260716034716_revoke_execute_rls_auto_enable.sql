/*
# Revoke public execute on rls_auto_enable() event trigger function

1. Security changes
- The function `public.rls_auto_enable()` is a SECURITY DEFINER event
  trigger that automatically enables RLS on newly created tables in the
  `public` schema. It is intended to be invoked ONLY by the PostgreSQL
  event-trigger system, not by any application role.
- By default, PostgreSQL grants EXECUTE on functions to PUBLIC, which
  means the `anon` and `authenticated` roles (used by the Supabase
  REST/PostgREST API) could invoke it via `/rest/v1/rpc/rls_auto_enable`.
- This migration revokes EXECUTE from PUBLIC, anon, and authenticated so
  the function can no longer be called through the REST API. The event
  trigger itself continues to work because it runs with owner/superuser
  privileges outside the REST layer.
*/

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
