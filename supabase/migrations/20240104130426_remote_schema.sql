drop trigger if exists "invite-user" on "public"."org_invite";

alter table "public"."device" alter column "key" set not null;

alter table "public"."org_invite" add column "role" user_role default 'viewer'::user_role;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_user_current_org(user_jwt jsonb, org_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$DECLARE
    user_org_id int8;
    jwt_user_id uuid;
BEGIN
    -- Extract the org ID from the JWT token
    SELECT (((user_jwt -> 'user_metadata'::text) -> 'org'::text -> 'id'::text))::bigint INTO user_org_id;
    
    -- Check if the user has the correct org selected
    IF user_org_id = org_id THEN
        -- Extract the user ID from the JWT token
        SELECT (user_jwt->>'sub'::text)::uuid INTO jwt_user_id;
        
        -- Check if the user has an entry for that org in the org_member table
        RETURN EXISTS (
            SELECT 1
            FROM org_member
            WHERE org_member.user_id = jwt_user_id
            AND org_member.org_id = check_user_current_org.org_id
        );
    END IF;

    RETURN FALSE;
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_abn(abn_input text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    ABN_MAX_CHARS constant int := 14;
    ABN_DIGITS constant int := 11;
    WEIGHTING constant int[] := '{10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19}';
    MODULUS constant int := 89;
    
    abn text;
    temp_abn int[];
    remainder int;
    i int;
BEGIN
    abn := regexp_replace(abn_input, '\D', '', 'g');
    
    IF length(abn) > ABN_MAX_CHARS THEN
        RETURN FALSE;
    END IF;
    
    abn := replace(abn, ' ', '');
    
    IF length(abn) != ABN_DIGITS OR substr(abn, 1, 1) = '0' THEN
        RETURN FALSE;
    END IF;
    
    temp_abn := '{}'::int[];
    FOR i IN 1..ABN_DIGITS LOOP
        temp_abn := temp_abn || substr(abn, i, 1)::int;
    END LOOP;
    
    temp_abn[1] := temp_abn[1] - 1;
    remainder := 0;
    FOR i IN 1..ABN_DIGITS LOOP
        remainder := remainder + (temp_abn[i] * WEIGHTING[i]);
    END LOOP;
    
    remainder := remainder % MODULUS;
    
    IF remainder != 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$function$
;

create policy "Enable INSERT for authenticated users only"
on "public"."org_member"
as permissive
for insert
to authenticated
with check ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'owner'::user_role)));


create policy "Enable UPDATE for users based on user_id"
on "public"."org_member"
as permissive
for update
to authenticated
using ((check_org_membership(org_id, auth.uid()) AND (((((auth.jwt() -> 'user_metadata'::text) -> 'org'::text) -> 'id'::text))::bigint = org_id)));