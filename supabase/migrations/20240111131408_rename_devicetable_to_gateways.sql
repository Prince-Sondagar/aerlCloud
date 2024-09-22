drop policy "Allow DELETE for users in org" on "public"."device";

drop policy "Allow INSERT for users in org" on "public"."device";

drop policy "Allow SELECT for devices in users org" on "public"."device";

drop policy "Allow UPDATE for users in org" on "public"."device";

revoke delete on table "public"."device" from "anon";

revoke insert on table "public"."device" from "anon";

revoke references on table "public"."device" from "anon";

revoke select on table "public"."device" from "anon";

revoke trigger on table "public"."device" from "anon";

revoke truncate on table "public"."device" from "anon";

revoke update on table "public"."device" from "anon";

revoke delete on table "public"."device" from "authenticated";

revoke insert on table "public"."device" from "authenticated";

revoke references on table "public"."device" from "authenticated";

revoke select on table "public"."device" from "authenticated";

revoke trigger on table "public"."device" from "authenticated";

revoke truncate on table "public"."device" from "authenticated";

revoke update on table "public"."device" from "authenticated";

revoke delete on table "public"."device" from "service_role";

revoke insert on table "public"."device" from "service_role";

revoke references on table "public"."device" from "service_role";

revoke select on table "public"."device" from "service_role";

revoke trigger on table "public"."device" from "service_role";

revoke truncate on table "public"."device" from "service_role";

revoke update on table "public"."device" from "service_role";

alter table "public"."device" drop constraint "device_hub_id_fkey";

alter table "public"."device" drop constraint "device_hub_id_key";

alter table "public"."device" drop constraint "device_location_id_fkey";

alter table "public"."device" drop constraint "device_name_check";

alter table "public"."device" drop constraint "device_notes_check";

alter table "public"."device" drop constraint "device_org_id_fkey";

alter table "public"."modbus_interface" drop constraint "modbus_interface_device_id_fkey";

alter table "public"."device" drop constraint "device_pkey";

drop index if exists "public"."device_hub_id_key";

drop index if exists "public"."device_pkey";

drop table "public"."device";

create table "public"."gateways" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "last_seen" timestamp with time zone,
    "org_id" bigint not null,
    "hub_id" text not null,
    "notes" text,
    "tag" text,
    "key" text not null generated always as (id_encode(id, ''::text, 4)) stored,
    "location_id" bigint,
    "fw_version" TEXT
);


alter table "public"."gateways" enable row level security;

alter table "public"."location" add column "coordinate" point;

CREATE UNIQUE INDEX device_hub_id_key ON public.gateways USING btree (hub_id);

CREATE UNIQUE INDEX device_pkey ON public.gateways USING btree (id);

alter table "public"."gateways" add constraint "device_pkey" PRIMARY KEY using index "device_pkey";

alter table "public"."gateways" add constraint "device_hub_id_key" UNIQUE using index "device_hub_id_key";

alter table "public"."gateways" add constraint "device_name_check" CHECK ((length(tag) < 200)) not valid;

alter table "public"."gateways" validate constraint "device_name_check";

alter table "public"."gateways" add constraint "device_notes_check" CHECK ((length(notes) < 1000)) not valid;

alter table "public"."gateways" validate constraint "device_notes_check";

alter table "public"."gateways" add constraint "gateways_hub_id_fkey" FOREIGN KEY (hub_id) REFERENCES hub(id) not valid;

alter table "public"."gateways" validate constraint "gateways_hub_id_fkey";

alter table "public"."gateways" add constraint "gateways_location_id_fkey" FOREIGN KEY (location_id) REFERENCES location(id) not valid;

alter table "public"."gateways" validate constraint "gateways_location_id_fkey";

alter table "public"."gateways" add constraint "gateways_org_id_fkey" FOREIGN KEY (org_id) REFERENCES org(id) not valid;

alter table "public"."gateways" validate constraint "gateways_org_id_fkey";

alter table "public"."modbus_interface" add constraint "modbus_interface_device_id_fkey" FOREIGN KEY (device_id) REFERENCES gateways(id) ON DELETE CASCADE not valid;

alter table "public"."modbus_interface" validate constraint "modbus_interface_device_id_fkey";

grant delete on table "public"."gateways" to "anon";

grant insert on table "public"."gateways" to "anon";

grant references on table "public"."gateways" to "anon";

grant select on table "public"."gateways" to "anon";

grant trigger on table "public"."gateways" to "anon";

grant truncate on table "public"."gateways" to "anon";

grant update on table "public"."gateways" to "anon";

grant delete on table "public"."gateways" to "authenticated";

grant insert on table "public"."gateways" to "authenticated";

grant references on table "public"."gateways" to "authenticated";

grant select on table "public"."gateways" to "authenticated";

grant trigger on table "public"."gateways" to "authenticated";

grant truncate on table "public"."gateways" to "authenticated";

grant update on table "public"."gateways" to "authenticated";

grant delete on table "public"."gateways" to "service_role";

grant insert on table "public"."gateways" to "service_role";

grant references on table "public"."gateways" to "service_role";

grant select on table "public"."gateways" to "service_role";

grant trigger on table "public"."gateways" to "service_role";

grant truncate on table "public"."gateways" to "service_role";

grant update on table "public"."gateways" to "service_role";

create policy "Allow DELETE for users in org"
on "public"."gateways"
as permissive
for delete
to authenticated
using ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'admin'::user_role)));


create policy "Allow INSERT for users in org"
on "public"."gateways"
as permissive
for insert
to authenticated
with check ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)));


create policy "Allow SELECT for devices in users org"
on "public"."gateways"
as permissive
for select
to authenticated
using ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'viewer'::user_role)));


create policy "Allow UPDATE for users in org"
on "public"."gateways"
as permissive
for update
to authenticated
using ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)))
with check ((check_user_current_org(auth.jwt(), org_id) AND check_user_access(auth.uid(), org_id, 'technician'::user_role)));