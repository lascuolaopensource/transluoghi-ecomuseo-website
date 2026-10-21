import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
	await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('it', 'en');
  CREATE TYPE "public"."enum_itinerari_type" AS ENUM('loop', 'out_and_back');
  CREATE TYPE "public"."enum_itinerari_difficulty" AS ENUM('touristic', 'hiking', 'expert_hiking');
  CREATE TYPE "public"."enum_articoli_tag" AS ENUM('evento', 'notizia', 'reportage', 'comunicato-stampa');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "video" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "video_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tracciati" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "itinerari_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "itinerari_services_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "itinerari_geolocalized_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"position" geometry(Point) NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "itinerari" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"length" varchar,
  	"duration" varchar,
  	"elevation" varchar,
  	"type" "enum_itinerari_type",
  	"difficulty" "enum_itinerari_difficulty",
  	"gpx_track_id" integer,
  	"copertina_id" integer,
  	"video_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "itinerari_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "itinerari_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"luoghi_id" integer,
  	"persone_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "luoghi_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar,
  	"email" varchar,
  	"telefono" varchar
  );
  
  CREATE TABLE "luoghi_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "luoghi_services_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "luoghi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"address" varchar,
  	"coordinates" geometry(Point),
  	"copertina_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "luoghi_locales" (
  	"name" varchar NOT NULL,
  	"timetable" jsonb,
  	"description" jsonb NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "luoghi_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"persone_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "persone_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar,
  	"email" varchar,
  	"telefono" varchar
  );
  
  CREATE TABLE "persone" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"address" varchar,
  	"coordinates" geometry(Point),
  	"copertina_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "persone_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "persone_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "residenze_program" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "residenze_program_locales" (
  	"step_name" varchar,
  	"step_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "residenze_people_organizations" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "residenze_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"foto_id" integer
  );
  
  CREATE TABLE "residenze_people_locales" (
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "residenze" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"address" varchar,
  	"coordinates" geometry(Point),
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"has_registration" boolean,
  	"registration_deadline" timestamp(3) with time zone,
  	"registration_url" varchar,
  	"registration_open" boolean,
  	"short_description" varchar NOT NULL,
  	"copertina_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "residenze_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"story" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "residenze_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "articoli" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"date" timestamp(3) with time zone,
  	"tag" "enum_articoli_tag",
  	"copertina_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articoli_locales" (
  	"name" varchar NOT NULL,
  	"subtitle" varchar,
  	"contents" jsonb NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articoli_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "social_post" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"link" varchar,
  	"media_id" integer,
  	"owner_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "social_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "social_account_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "social_account" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"persona_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"video_id" integer,
  	"tracciati_id" integer,
  	"itinerari_id" integer,
  	"luoghi_id" integer,
  	"persone_id" integer,
  	"residenze_id" integer,
  	"articoli_id" integer,
  	"social_post_id" integer,
  	"social_media_id" integer,
  	"social_account_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"social_account_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_locales" (
  	"statement" varchar NOT NULL,
  	"introduzione" jsonb NOT NULL,
  	"sections_itinerari_title" varchar NOT NULL,
  	"sections_itinerari_description" jsonb NOT NULL,
  	"sections_luoghi_title" varchar NOT NULL,
  	"sections_luoghi_description" jsonb NOT NULL,
  	"sections_residenze_title" varchar NOT NULL,
  	"sections_residenze_description" jsonb NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"luoghi_id" integer,
  	"residenze_id" integer
  );
  
  CREATE TABLE "testi" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "testi_locales" (
  	"luoghi_title" varchar NOT NULL,
  	"luoghi_description" jsonb NOT NULL,
  	"itinerari_title" varchar NOT NULL,
  	"itinerari_description" jsonb NOT NULL,
  	"residenze_title" varchar NOT NULL,
  	"residenze_description" jsonb NOT NULL,
  	"persone_title" varchar NOT NULL,
  	"persone_description" jsonb NOT NULL,
  	"articoli_title" varchar NOT NULL,
  	"articoli_description" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_social_networks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"text_left" jsonb,
  	"text_right" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "chi_siamo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"copertina_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "chi_siamo_locales" (
  	"description" jsonb NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "chi_siamo_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "mobilita_sostenibile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"copertina_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "mobilita_sostenibile_locales" (
  	"description" jsonb NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "mobilita_sostenibile_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_locales" ADD CONSTRAINT "video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari_services" ADD CONSTRAINT "itinerari_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itinerari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari_services_locales" ADD CONSTRAINT "itinerari_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itinerari_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari_geolocalized_media" ADD CONSTRAINT "itinerari_geolocalized_media_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "itinerari_geolocalized_media" ADD CONSTRAINT "itinerari_geolocalized_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itinerari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari" ADD CONSTRAINT "itinerari_gpx_track_id_tracciati_id_fk" FOREIGN KEY ("gpx_track_id") REFERENCES "public"."tracciati"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "itinerari" ADD CONSTRAINT "itinerari_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "itinerari" ADD CONSTRAINT "itinerari_video_id_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "itinerari_locales" ADD CONSTRAINT "itinerari_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "itinerari_locales" ADD CONSTRAINT "itinerari_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."itinerari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari_rels" ADD CONSTRAINT "itinerari_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."itinerari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari_rels" ADD CONSTRAINT "itinerari_rels_luoghi_fk" FOREIGN KEY ("luoghi_id") REFERENCES "public"."luoghi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari_rels" ADD CONSTRAINT "itinerari_rels_persone_fk" FOREIGN KEY ("persone_id") REFERENCES "public"."persone"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "itinerari_rels" ADD CONSTRAINT "itinerari_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "luoghi_contacts" ADD CONSTRAINT "luoghi_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."luoghi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "luoghi_services" ADD CONSTRAINT "luoghi_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."luoghi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "luoghi_services_locales" ADD CONSTRAINT "luoghi_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."luoghi_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "luoghi" ADD CONSTRAINT "luoghi_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "luoghi_locales" ADD CONSTRAINT "luoghi_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "luoghi_locales" ADD CONSTRAINT "luoghi_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."luoghi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "luoghi_rels" ADD CONSTRAINT "luoghi_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."luoghi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "luoghi_rels" ADD CONSTRAINT "luoghi_rels_persone_fk" FOREIGN KEY ("persone_id") REFERENCES "public"."persone"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "luoghi_rels" ADD CONSTRAINT "luoghi_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "persone_contacts" ADD CONSTRAINT "persone_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."persone"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "persone" ADD CONSTRAINT "persone_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "persone_locales" ADD CONSTRAINT "persone_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "persone_locales" ADD CONSTRAINT "persone_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."persone"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "persone_rels" ADD CONSTRAINT "persone_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."persone"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "persone_rels" ADD CONSTRAINT "persone_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze_program" ADD CONSTRAINT "residenze_program_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residenze"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze_program_locales" ADD CONSTRAINT "residenze_program_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residenze_program"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze_people_organizations" ADD CONSTRAINT "residenze_people_organizations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residenze_people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze_people" ADD CONSTRAINT "residenze_people_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residenze_people" ADD CONSTRAINT "residenze_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residenze"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze_people_locales" ADD CONSTRAINT "residenze_people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residenze_people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze" ADD CONSTRAINT "residenze_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residenze_locales" ADD CONSTRAINT "residenze_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residenze_locales" ADD CONSTRAINT "residenze_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residenze"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze_rels" ADD CONSTRAINT "residenze_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."residenze"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residenze_rels" ADD CONSTRAINT "residenze_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articoli" ADD CONSTRAINT "articoli_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articoli_locales" ADD CONSTRAINT "articoli_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articoli_locales" ADD CONSTRAINT "articoli_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articoli"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articoli_rels" ADD CONSTRAINT "articoli_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articoli"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articoli_rels" ADD CONSTRAINT "articoli_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_post" ADD CONSTRAINT "social_post_media_id_social_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."social_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_post" ADD CONSTRAINT "social_post_owner_id_social_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."social_account"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_account_sessions" ADD CONSTRAINT "social_account_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_account"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_account" ADD CONSTRAINT "social_account_persona_id_persone_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."persone"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tracciati_fk" FOREIGN KEY ("tracciati_id") REFERENCES "public"."tracciati"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_itinerari_fk" FOREIGN KEY ("itinerari_id") REFERENCES "public"."itinerari"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_luoghi_fk" FOREIGN KEY ("luoghi_id") REFERENCES "public"."luoghi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_persone_fk" FOREIGN KEY ("persone_id") REFERENCES "public"."persone"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_residenze_fk" FOREIGN KEY ("residenze_id") REFERENCES "public"."residenze"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articoli_fk" FOREIGN KEY ("articoli_id") REFERENCES "public"."articoli"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_post_fk" FOREIGN KEY ("social_post_id") REFERENCES "public"."social_post"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_media_fk" FOREIGN KEY ("social_media_id") REFERENCES "public"."social_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_account_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."social_account"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_social_account_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."social_account"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_luoghi_fk" FOREIGN KEY ("luoghi_id") REFERENCES "public"."luoghi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_residenze_fk" FOREIGN KEY ("residenze_id") REFERENCES "public"."residenze"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testi_locales" ADD CONSTRAINT "testi_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testi"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_networks" ADD CONSTRAINT "footer_social_networks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chi_siamo" ADD CONSTRAINT "chi_siamo_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chi_siamo_locales" ADD CONSTRAINT "chi_siamo_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chi_siamo_locales" ADD CONSTRAINT "chi_siamo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chi_siamo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chi_siamo_rels" ADD CONSTRAINT "chi_siamo_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chi_siamo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chi_siamo_rels" ADD CONSTRAINT "chi_siamo_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mobilita_sostenibile" ADD CONSTRAINT "mobilita_sostenibile_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mobilita_sostenibile_locales" ADD CONSTRAINT "mobilita_sostenibile_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mobilita_sostenibile_locales" ADD CONSTRAINT "mobilita_sostenibile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mobilita_sostenibile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mobilita_sostenibile_rels" ADD CONSTRAINT "mobilita_sostenibile_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mobilita_sostenibile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mobilita_sostenibile_rels" ADD CONSTRAINT "mobilita_sostenibile_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "video_updated_at_idx" ON "video" USING btree ("updated_at");
  CREATE INDEX "video_created_at_idx" ON "video" USING btree ("created_at");
  CREATE UNIQUE INDEX "video_filename_idx" ON "video" USING btree ("filename");
  CREATE UNIQUE INDEX "video_locales_locale_parent_id_unique" ON "video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tracciati_updated_at_idx" ON "tracciati" USING btree ("updated_at");
  CREATE INDEX "tracciati_created_at_idx" ON "tracciati" USING btree ("created_at");
  CREATE UNIQUE INDEX "tracciati_filename_idx" ON "tracciati" USING btree ("filename");
  CREATE INDEX "itinerari_services_order_idx" ON "itinerari_services" USING btree ("_order");
  CREATE INDEX "itinerari_services_parent_id_idx" ON "itinerari_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "itinerari_services_locales_locale_parent_id_unique" ON "itinerari_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "itinerari_geolocalized_media_order_idx" ON "itinerari_geolocalized_media" USING btree ("_order");
  CREATE INDEX "itinerari_geolocalized_media_parent_id_idx" ON "itinerari_geolocalized_media" USING btree ("_parent_id");
  CREATE INDEX "itinerari_geolocalized_media_image_idx" ON "itinerari_geolocalized_media" USING btree ("image_id");
  CREATE UNIQUE INDEX "itinerari_slug_idx" ON "itinerari" USING btree ("slug");
  CREATE INDEX "itinerari_gpx_track_idx" ON "itinerari" USING btree ("gpx_track_id");
  CREATE INDEX "itinerari_copertina_idx" ON "itinerari" USING btree ("copertina_id");
  CREATE INDEX "itinerari_video_idx" ON "itinerari" USING btree ("video_id");
  CREATE INDEX "itinerari_updated_at_idx" ON "itinerari" USING btree ("updated_at");
  CREATE INDEX "itinerari_created_at_idx" ON "itinerari" USING btree ("created_at");
  CREATE INDEX "itinerari_meta_meta_image_idx" ON "itinerari_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "itinerari_locales_locale_parent_id_unique" ON "itinerari_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "itinerari_rels_order_idx" ON "itinerari_rels" USING btree ("order");
  CREATE INDEX "itinerari_rels_parent_idx" ON "itinerari_rels" USING btree ("parent_id");
  CREATE INDEX "itinerari_rels_path_idx" ON "itinerari_rels" USING btree ("path");
  CREATE INDEX "itinerari_rels_luoghi_id_idx" ON "itinerari_rels" USING btree ("luoghi_id");
  CREATE INDEX "itinerari_rels_persone_id_idx" ON "itinerari_rels" USING btree ("persone_id");
  CREATE INDEX "itinerari_rels_media_id_idx" ON "itinerari_rels" USING btree ("media_id");
  CREATE INDEX "luoghi_contacts_order_idx" ON "luoghi_contacts" USING btree ("_order");
  CREATE INDEX "luoghi_contacts_parent_id_idx" ON "luoghi_contacts" USING btree ("_parent_id");
  CREATE INDEX "luoghi_services_order_idx" ON "luoghi_services" USING btree ("_order");
  CREATE INDEX "luoghi_services_parent_id_idx" ON "luoghi_services" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "luoghi_services_locales_locale_parent_id_unique" ON "luoghi_services_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "luoghi_slug_idx" ON "luoghi" USING btree ("slug");
  CREATE INDEX "luoghi_copertina_idx" ON "luoghi" USING btree ("copertina_id");
  CREATE INDEX "luoghi_updated_at_idx" ON "luoghi" USING btree ("updated_at");
  CREATE INDEX "luoghi_created_at_idx" ON "luoghi" USING btree ("created_at");
  CREATE INDEX "luoghi_meta_meta_image_idx" ON "luoghi_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "luoghi_locales_locale_parent_id_unique" ON "luoghi_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "luoghi_rels_order_idx" ON "luoghi_rels" USING btree ("order");
  CREATE INDEX "luoghi_rels_parent_idx" ON "luoghi_rels" USING btree ("parent_id");
  CREATE INDEX "luoghi_rels_path_idx" ON "luoghi_rels" USING btree ("path");
  CREATE INDEX "luoghi_rels_persone_id_idx" ON "luoghi_rels" USING btree ("persone_id");
  CREATE INDEX "luoghi_rels_media_id_idx" ON "luoghi_rels" USING btree ("media_id");
  CREATE INDEX "persone_contacts_order_idx" ON "persone_contacts" USING btree ("_order");
  CREATE INDEX "persone_contacts_parent_id_idx" ON "persone_contacts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "persone_slug_idx" ON "persone" USING btree ("slug");
  CREATE INDEX "persone_copertina_idx" ON "persone" USING btree ("copertina_id");
  CREATE INDEX "persone_updated_at_idx" ON "persone" USING btree ("updated_at");
  CREATE INDEX "persone_created_at_idx" ON "persone" USING btree ("created_at");
  CREATE INDEX "persone_meta_meta_image_idx" ON "persone_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "persone_locales_locale_parent_id_unique" ON "persone_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "persone_rels_order_idx" ON "persone_rels" USING btree ("order");
  CREATE INDEX "persone_rels_parent_idx" ON "persone_rels" USING btree ("parent_id");
  CREATE INDEX "persone_rels_path_idx" ON "persone_rels" USING btree ("path");
  CREATE INDEX "persone_rels_media_id_idx" ON "persone_rels" USING btree ("media_id");
  CREATE INDEX "residenze_program_order_idx" ON "residenze_program" USING btree ("_order");
  CREATE INDEX "residenze_program_parent_id_idx" ON "residenze_program" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "residenze_program_locales_locale_parent_id_unique" ON "residenze_program_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "residenze_people_organizations_order_idx" ON "residenze_people_organizations" USING btree ("_order");
  CREATE INDEX "residenze_people_organizations_parent_id_idx" ON "residenze_people_organizations" USING btree ("_parent_id");
  CREATE INDEX "residenze_people_order_idx" ON "residenze_people" USING btree ("_order");
  CREATE INDEX "residenze_people_parent_id_idx" ON "residenze_people" USING btree ("_parent_id");
  CREATE INDEX "residenze_people_foto_idx" ON "residenze_people" USING btree ("foto_id");
  CREATE UNIQUE INDEX "residenze_people_locales_locale_parent_id_unique" ON "residenze_people_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "residenze_slug_idx" ON "residenze" USING btree ("slug");
  CREATE INDEX "residenze_copertina_idx" ON "residenze" USING btree ("copertina_id");
  CREATE INDEX "residenze_updated_at_idx" ON "residenze" USING btree ("updated_at");
  CREATE INDEX "residenze_created_at_idx" ON "residenze" USING btree ("created_at");
  CREATE INDEX "residenze_meta_meta_image_idx" ON "residenze_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "residenze_locales_locale_parent_id_unique" ON "residenze_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "residenze_rels_order_idx" ON "residenze_rels" USING btree ("order");
  CREATE INDEX "residenze_rels_parent_idx" ON "residenze_rels" USING btree ("parent_id");
  CREATE INDEX "residenze_rels_path_idx" ON "residenze_rels" USING btree ("path");
  CREATE INDEX "residenze_rels_media_id_idx" ON "residenze_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "articoli_slug_idx" ON "articoli" USING btree ("slug");
  CREATE INDEX "articoli_copertina_idx" ON "articoli" USING btree ("copertina_id");
  CREATE INDEX "articoli_updated_at_idx" ON "articoli" USING btree ("updated_at");
  CREATE INDEX "articoli_created_at_idx" ON "articoli" USING btree ("created_at");
  CREATE INDEX "articoli_meta_meta_image_idx" ON "articoli_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "articoli_locales_locale_parent_id_unique" ON "articoli_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articoli_rels_order_idx" ON "articoli_rels" USING btree ("order");
  CREATE INDEX "articoli_rels_parent_idx" ON "articoli_rels" USING btree ("parent_id");
  CREATE INDEX "articoli_rels_path_idx" ON "articoli_rels" USING btree ("path");
  CREATE INDEX "articoli_rels_media_id_idx" ON "articoli_rels" USING btree ("media_id");
  CREATE INDEX "social_post_media_idx" ON "social_post" USING btree ("media_id");
  CREATE INDEX "social_post_owner_idx" ON "social_post" USING btree ("owner_id");
  CREATE INDEX "social_post_updated_at_idx" ON "social_post" USING btree ("updated_at");
  CREATE INDEX "social_post_created_at_idx" ON "social_post" USING btree ("created_at");
  CREATE INDEX "social_media_updated_at_idx" ON "social_media" USING btree ("updated_at");
  CREATE INDEX "social_media_created_at_idx" ON "social_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "social_media_filename_idx" ON "social_media" USING btree ("filename");
  CREATE INDEX "social_media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "social_media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "social_media_sizes_small_sizes_small_filename_idx" ON "social_media" USING btree ("sizes_small_filename");
  CREATE INDEX "social_media_sizes_medium_sizes_medium_filename_idx" ON "social_media" USING btree ("sizes_medium_filename");
  CREATE INDEX "social_media_sizes_large_sizes_large_filename_idx" ON "social_media" USING btree ("sizes_large_filename");
  CREATE INDEX "social_media_sizes_xlarge_sizes_xlarge_filename_idx" ON "social_media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "social_media_sizes_og_sizes_og_filename_idx" ON "social_media" USING btree ("sizes_og_filename");
  CREATE INDEX "social_account_sessions_order_idx" ON "social_account_sessions" USING btree ("_order");
  CREATE INDEX "social_account_sessions_parent_id_idx" ON "social_account_sessions" USING btree ("_parent_id");
  CREATE INDEX "social_account_persona_idx" ON "social_account" USING btree ("persona_id");
  CREATE INDEX "social_account_updated_at_idx" ON "social_account" USING btree ("updated_at");
  CREATE INDEX "social_account_created_at_idx" ON "social_account" USING btree ("created_at");
  CREATE UNIQUE INDEX "social_account_email_idx" ON "social_account" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_video_id_idx" ON "payload_locked_documents_rels" USING btree ("video_id");
  CREATE INDEX "payload_locked_documents_rels_tracciati_id_idx" ON "payload_locked_documents_rels" USING btree ("tracciati_id");
  CREATE INDEX "payload_locked_documents_rels_itinerari_id_idx" ON "payload_locked_documents_rels" USING btree ("itinerari_id");
  CREATE INDEX "payload_locked_documents_rels_luoghi_id_idx" ON "payload_locked_documents_rels" USING btree ("luoghi_id");
  CREATE INDEX "payload_locked_documents_rels_persone_id_idx" ON "payload_locked_documents_rels" USING btree ("persone_id");
  CREATE INDEX "payload_locked_documents_rels_residenze_id_idx" ON "payload_locked_documents_rels" USING btree ("residenze_id");
  CREATE INDEX "payload_locked_documents_rels_articoli_id_idx" ON "payload_locked_documents_rels" USING btree ("articoli_id");
  CREATE INDEX "payload_locked_documents_rels_social_post_id_idx" ON "payload_locked_documents_rels" USING btree ("social_post_id");
  CREATE INDEX "payload_locked_documents_rels_social_media_id_idx" ON "payload_locked_documents_rels" USING btree ("social_media_id");
  CREATE INDEX "payload_locked_documents_rels_social_account_id_idx" ON "payload_locked_documents_rels" USING btree ("social_account_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_social_account_id_idx" ON "payload_preferences_rels" USING btree ("social_account_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_cover_idx" ON "home" USING btree ("cover_id");
  CREATE INDEX "home_meta_meta_image_idx" ON "home_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_rels_order_idx" ON "home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "home_rels" USING btree ("path");
  CREATE INDEX "home_rels_luoghi_id_idx" ON "home_rels" USING btree ("luoghi_id");
  CREATE INDEX "home_rels_residenze_id_idx" ON "home_rels" USING btree ("residenze_id");
  CREATE UNIQUE INDEX "testi_locales_locale_parent_id_unique" ON "testi_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_social_networks_order_idx" ON "footer_social_networks" USING btree ("_order");
  CREATE INDEX "footer_social_networks_parent_id_idx" ON "footer_social_networks" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "chi_siamo_copertina_idx" ON "chi_siamo" USING btree ("copertina_id");
  CREATE INDEX "chi_siamo_meta_meta_image_idx" ON "chi_siamo_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "chi_siamo_locales_locale_parent_id_unique" ON "chi_siamo_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "chi_siamo_rels_order_idx" ON "chi_siamo_rels" USING btree ("order");
  CREATE INDEX "chi_siamo_rels_parent_idx" ON "chi_siamo_rels" USING btree ("parent_id");
  CREATE INDEX "chi_siamo_rels_path_idx" ON "chi_siamo_rels" USING btree ("path");
  CREATE INDEX "chi_siamo_rels_media_id_idx" ON "chi_siamo_rels" USING btree ("media_id");
  CREATE INDEX "mobilita_sostenibile_copertina_idx" ON "mobilita_sostenibile" USING btree ("copertina_id");
  CREATE INDEX "mobilita_sostenibile_meta_meta_image_idx" ON "mobilita_sostenibile_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "mobilita_sostenibile_locales_locale_parent_id_unique" ON "mobilita_sostenibile_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "mobilita_sostenibile_rels_order_idx" ON "mobilita_sostenibile_rels" USING btree ("order");
  CREATE INDEX "mobilita_sostenibile_rels_parent_idx" ON "mobilita_sostenibile_rels" USING btree ("parent_id");
  CREATE INDEX "mobilita_sostenibile_rels_path_idx" ON "mobilita_sostenibile_rels" USING btree ("path");
  CREATE INDEX "mobilita_sostenibile_rels_media_id_idx" ON "mobilita_sostenibile_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
	await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "video" CASCADE;
  DROP TABLE "video_locales" CASCADE;
  DROP TABLE "tracciati" CASCADE;
  DROP TABLE "itinerari_services" CASCADE;
  DROP TABLE "itinerari_services_locales" CASCADE;
  DROP TABLE "itinerari_geolocalized_media" CASCADE;
  DROP TABLE "itinerari" CASCADE;
  DROP TABLE "itinerari_locales" CASCADE;
  DROP TABLE "itinerari_rels" CASCADE;
  DROP TABLE "luoghi_contacts" CASCADE;
  DROP TABLE "luoghi_services" CASCADE;
  DROP TABLE "luoghi_services_locales" CASCADE;
  DROP TABLE "luoghi" CASCADE;
  DROP TABLE "luoghi_locales" CASCADE;
  DROP TABLE "luoghi_rels" CASCADE;
  DROP TABLE "persone_contacts" CASCADE;
  DROP TABLE "persone" CASCADE;
  DROP TABLE "persone_locales" CASCADE;
  DROP TABLE "persone_rels" CASCADE;
  DROP TABLE "residenze_program" CASCADE;
  DROP TABLE "residenze_program_locales" CASCADE;
  DROP TABLE "residenze_people_organizations" CASCADE;
  DROP TABLE "residenze_people" CASCADE;
  DROP TABLE "residenze_people_locales" CASCADE;
  DROP TABLE "residenze" CASCADE;
  DROP TABLE "residenze_locales" CASCADE;
  DROP TABLE "residenze_rels" CASCADE;
  DROP TABLE "articoli" CASCADE;
  DROP TABLE "articoli_locales" CASCADE;
  DROP TABLE "articoli_rels" CASCADE;
  DROP TABLE "social_post" CASCADE;
  DROP TABLE "social_media" CASCADE;
  DROP TABLE "social_account_sessions" CASCADE;
  DROP TABLE "social_account" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "home_rels" CASCADE;
  DROP TABLE "testi" CASCADE;
  DROP TABLE "testi_locales" CASCADE;
  DROP TABLE "footer_social_networks" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "chi_siamo" CASCADE;
  DROP TABLE "chi_siamo_locales" CASCADE;
  DROP TABLE "chi_siamo_rels" CASCADE;
  DROP TABLE "mobilita_sostenibile" CASCADE;
  DROP TABLE "mobilita_sostenibile_locales" CASCADE;
  DROP TABLE "mobilita_sostenibile_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_itinerari_type";
  DROP TYPE "public"."enum_itinerari_difficulty";
  DROP TYPE "public"."enum_articoli_tag";`)
}
