create type "public"."invite_status" as enum ('pending', 'declined');

alter table "public"."org_invite" add column "status" invite_status default 'pending'::invite_status;