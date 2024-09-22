drop policy "Allow UPDATE for alerts in users' org" on "public"."alert";

drop policy "Allow INSERT for users in org" on "public"."device";

drop policy "Allow UPDATE for users in org" on "public"."device";

drop policy "Allow DELETE for users in org" on "public"."org_invite";

alter table "public"."org_invite" alter column "role" drop default;

alter table "public"."org_member" alter column "role" drop default;

ALTER TYPE "public"."user_role" RENAME VALUE 'editor' TO 'technician';

alter table "public"."org_invite" alter column role type "public"."user_role" using role::text::"public"."user_role";

alter table "public"."org_member" alter column role type "public"."user_role" using role::text::"public"."user_role";

alter table "public"."org_invite" alter column "role" set default 'viewer'::user_role;

alter table "public"."org_member" alter column "role" set default 'viewer'::user_role;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_user_access(user_id uuid, org_id bigint, required_role user_role)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_role user_role;
BEGIN
  SELECT org_member.role INTO user_role
  FROM org_member
  WHERE (org_member.user_id = check_user_access.user_id) AND (org_member.org_id = check_user_access.org_id);

  IF user_role = 'owner' AND required_role = 'owner' THEN
    RETURN TRUE;
  ELSIF user_role IN ('admin', 'owner') AND required_role = 'admin' THEN
    RETURN TRUE;
  ELSIF user_role IN ('technician', 'admin', 'owner') AND required_role = 'technician' THEN
    RETURN TRUE;
  ELSIF user_role IN ('viewer', 'technician', 'admin', 'owner') AND required_role = 'viewer' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_access(user_id uuid, required_role user_role)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role
  FROM org_member
  WHERE org_member.user_id = check_user_access.user_id;

  IF user_role = 'owner' AND required_role = 'owner' THEN
    RETURN TRUE;
  ELSIF user_role IN ('admin', 'owner') AND required_role = 'admin' THEN
    RETURN TRUE;
  ELSIF user_role IN ('technician', 'admin', 'owner') AND required_role = 'technician' THEN
    RETURN TRUE;
  ELSIF user_role IN ('viewer', 'technician', 'admin', 'owner') AND required_role = 'viewer' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$
;

create policy "Allow UPDATE for authenticated users "
on "public"."org_invite"
as permissive
for update
to authenticated
using ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'owner'::user_role)));


create policy "Allow UPDATE for users based on user_id"
on "public"."org_member"
as permissive
for update
to authenticated
using ((check_org_membership(org_id, auth.uid()) AND (((((auth.jwt() -> 'user_metadata'::text) -> 'org'::text) -> 'id'::text))::bigint = org_id)));


create policy "Allow UPDATE for alerts in users' org"
on "public"."alert"
as permissive
for update
to authenticated
using ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)))
with check ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)));


create policy "Allow INSERT for users in org"
on "public"."device"
as permissive
for insert
to authenticated
with check ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)));


create policy "Allow UPDATE for users in org"
on "public"."device"
as permissive
for update
to authenticated
using ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)))
with check ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)));


create policy "Allow DELETE for users in org"
on "public"."org_invite"
as permissive
for delete
to authenticated
using ((check_user_current_org(auth.jwt(), org_id) AND (check_user_access(auth.uid(), org_id, 'owner'::user_role) OR check_user_access(auth.uid(), org_id, 'admin'::user_role))));
