-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.aura_oauth_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL,
  aura_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT aura_oauth_connections_pkey PRIMARY KEY (id),
  CONSTRAINT aura_oauth_connections_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id),
  CONSTRAINT aura_oauth_connections_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.oauth_connections(id)
);
CREATE TABLE public.aura_senses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  aura_id uuid,
  sense_id uuid,
  config jsonb DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT aura_senses_pkey PRIMARY KEY (id),
  CONSTRAINT aura_senses_sense_id_fkey FOREIGN KEY (sense_id) REFERENCES public.senses(id),
  CONSTRAINT aura_senses_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id)
);
CREATE TABLE public.auras (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL,
  vessel_type USER-DEFINED NOT NULL,
  personality jsonb NOT NULL,
  communication_style text DEFAULT 'balanced'::text,
  voice_profile text DEFAULT 'neutral'::text,
  avatar text,
  enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  senses ARRAY NOT NULL DEFAULT '{}'::text[],
  selected_individual_id uuid,
  selected_study_id uuid,
  vessel_code character varying,
  plant_type character varying,
  location_configs jsonb DEFAULT '{}'::jsonb,
  proactive_enabled boolean DEFAULT true,
  last_evaluation_at timestamp with time zone,
  CONSTRAINT auras_pkey PRIMARY KEY (id),
  CONSTRAINT auras_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.background_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::background_job_status,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT background_jobs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.behavior_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  aura_id uuid,
  name text NOT NULL,
  trigger jsonb NOT NULL,
  action jsonb NOT NULL,
  priority integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  last_triggered_at timestamp with time zone,
  trigger_count integer DEFAULT 0,
  notification_template text,
  notification_channels ARRAY DEFAULT ARRAY['in_app'::text],
  CONSTRAINT behavior_rules_pkey PRIMARY KEY (id),
  CONSTRAINT behavior_rules_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  aura_id uuid,
  session_id text NOT NULL UNIQUE,
  context jsonb,
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  ended_at timestamp with time zone,
  has_unread_proactive boolean DEFAULT false,
  unread_proactive_count integer DEFAULT 0,
  title text,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid,
  role USER-DEFINED NOT NULL,
  content text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.notification_delivery_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL,
  channel USER-DEFINED NOT NULL,
  attempted_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  failed_at timestamp with time zone,
  error_message text,
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT notification_delivery_log_pkey PRIMARY KEY (id),
  CONSTRAINT notification_delivery_log_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.proactive_messages(id)
);
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  aura_id uuid,
  channel USER-DEFINED NOT NULL,
  enabled boolean DEFAULT true,
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time without time zone,
  quiet_hours_end time without time zone,
  timezone text DEFAULT 'UTC'::text,
  max_per_day integer,
  priority_threshold integer DEFAULT 5,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT notification_preferences_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id),
  CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.oauth_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider character varying NOT NULL,
  provider_user_id character varying,
  sense_type character varying NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamp with time zone,
  scope text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  aura_id uuid,
  device_info jsonb,
  CONSTRAINT oauth_connections_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_connections_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id),
  CONSTRAINT oauth_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.proactive_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  aura_id uuid NOT NULL,
  rule_id uuid,
  conversation_id uuid,
  message text NOT NULL,
  trigger_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::notification_status,
  delivery_channel USER-DEFINED NOT NULL DEFAULT 'in_app'::notification_channel,
  retry_count integer DEFAULT 0,
  error_message text,
  CONSTRAINT proactive_messages_pkey PRIMARY KEY (id),
  CONSTRAINT proactive_messages_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.behavior_rules(id),
  CONSTRAINT proactive_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT proactive_messages_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  keys jsonb NOT NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.rule_execution_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL,
  aura_id uuid NOT NULL,
  executed_at timestamp with time zone DEFAULT now(),
  triggered boolean NOT NULL DEFAULT false,
  sensor_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  evaluation_result jsonb DEFAULT '{}'::jsonb,
  notification_sent boolean DEFAULT false,
  notification_id uuid,
  execution_time_ms integer,
  CONSTRAINT rule_execution_log_pkey PRIMARY KEY (id),
  CONSTRAINT rule_execution_log_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.behavior_rules(id),
  CONSTRAINT rule_execution_log_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.proactive_messages(id),
  CONSTRAINT rule_execution_log_aura_id_fkey FOREIGN KEY (aura_id) REFERENCES public.auras(id)
);
CREATE TABLE public.senses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  tier USER-DEFINED NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT senses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  tier USER-DEFINED DEFAULT 'free'::subscription_tier,
  status USER-DEFINED DEFAULT 'active'::subscription_status,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.wildlife_tracks (
  study_id integer NOT NULL,
  individual_id text NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  lat double precision,
  lon double precision,
  CONSTRAINT wildlife_tracks_pkey PRIMARY KEY (study_id, individual_id, timestamp)
);