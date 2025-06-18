create table "public"."profile" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "phone_number" text,
    "bio" text,
    "location" text,
    "website" text,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);

alter table "public"."profile" enable row level security;

create table "public"."task" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "description" text,
    "status" text not null default 'todo'::text,
    "priority" text not null default 'medium'::text,
    "due_date" timestamp with time zone,
    "assignee" text,
    "category" text,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);

alter table "public"."task" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "full_name" text not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);

alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (id);
CREATE UNIQUE INDEX task_pkey ON public.task USING btree (id);
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";
alter table "public"."task" add constraint "task_pkey" PRIMARY KEY using index "task_pkey";
alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."profile" add constraint "profile_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;
alter table "public"."profile" validate constraint "profile_user_id_fkey";

alter table "public"."task" add constraint "task_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;
alter table "public"."task" validate constraint "task_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_profile_for_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profile (user_id, phone_number, bio, location, website, created_at, updated_at)
  VALUES (NEW.id, '', '', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$;

-- Remove problematic triggers and add correct ones
DROP TRIGGER IF EXISTS create_profile ON public.profile;
DROP TRIGGER IF EXISTS create_task ON public.task;
DROP TRIGGER IF EXISTS create_users ON public.users;

CREATE TRIGGER create_profile_after_user_insert
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

CREATE TRIGGER update_profile_updated_at
BEFORE UPDATE ON public.profile
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_task_updated_at
BEFORE UPDATE ON public.task
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Permissions
grant delete on table "public"."profile" to "anon";
grant insert on table "public"."profile" to "anon";
grant references on table "public"."profile" to "anon";
grant select on table "public"."profile" to "anon";
grant trigger on table "public"."profile" to "anon";
grant truncate on table "public"."profile" to "anon";
grant update on table "public"."profile" to "anon";

grant delete on table "public"."profile" to "authenticated";
grant insert on table "public"."profile" to "authenticated";
grant references on table "public"."profile" to "authenticated";
grant select on table "public"."profile" to "authenticated";
grant trigger on table "public"."profile" to "authenticated";
grant truncate on table "public"."profile" to "authenticated";
grant update on table "public"."profile" to "authenticated";

grant delete on table "public"."profile" to "service_role";
grant insert on table "public"."profile" to "service_role";
grant references on table "public"."profile" to "service_role";
grant select on table "public"."profile" to "service_role";
grant trigger on table "public"."profile" to "service_role";
grant truncate on table "public"."profile" to "service_role";
grant update on table "public"."profile" to "service_role";

grant delete on table "public"."task" to "anon";
grant insert on table "public"."task" to "anon";
grant references on table "public"."task" to "anon";
grant select on table "public"."task" to "anon";
grant trigger on table "public"."task" to "anon";
grant truncate on table "public"."task" to "anon";
grant update on table "public"."task" to "anon";

grant delete on table "public"."task" to "authenticated";
grant insert on table "public"."task" to "authenticated";
grant references on table "public"."task" to "authenticated";
grant select on table "public"."task" to "authenticated";
grant trigger on table "public"."task" to "authenticated";
grant truncate on table "public"."task" to "authenticated";
grant update on table "public"."task" to "authenticated";

grant delete on table "public"."task" to "service_role";
grant insert on table "public"."task" to "service_role";
grant references on table "public"."task" to "service_role";
grant select on table "public"."task" to "service_role";
grant trigger on table "public"."task" to "service_role";
grant truncate on table "public"."task" to "service_role";
grant update on table "public"."task" to "service_role";

grant delete on table "public"."users" to "anon";
grant insert on table "public"."users" to "anon";
grant references on table "public"."users" to "anon";
grant select on table "public"."users" to "anon";
grant trigger on table "public"."users" to "anon";
grant truncate on table "public"."users" to "anon";
grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";
grant insert on table "public"."users" to "authenticated";
grant references on table "public"."users" to "authenticated";
grant select on table "public"."users" to "authenticated";
grant trigger on table "public"."users" to "authenticated";
grant truncate on table "public"."users" to "authenticated";
grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";
grant insert on table "public"."users" to "service_role";
grant references on table "public"."users" to "service_role";
grant select on table "public"."users" to "service_role";
grant trigger on table "public"."users" to "service_role";
grant truncate on table "public"."users" to "service_role";
grant update on table "public"."users" to "service_role";

-- RLS Policies
create policy "profile_insert"
on "public"."profile"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));

create policy "profile_update"
on "public"."profile"
as permissive
for update
to authenticated
using ((user_id = auth.uid()));

create policy "task_delete"
on "public"."task"
as permissive
for delete
to authenticated
using ((user_id = auth.uid()));

create policy "task_insert"
on "public"."task"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));

create policy "task_update"
on "public"."task"
as permissive
for update
to authenticated
using ((user_id = auth.uid()));

create policy "user_select"
on "public"."users"
as permissive
for select
to authenticated
using ((id = auth.uid()));