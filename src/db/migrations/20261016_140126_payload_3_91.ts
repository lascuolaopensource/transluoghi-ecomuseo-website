import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
	await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "video" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "tracciati" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "social_media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "social_account" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "video_locales_parent_id_idx" ON "video_locales" USING btree ("_parent_id");
  CREATE INDEX "itinerari_services_locales_parent_id_idx" ON "itinerari_services_locales" USING btree ("_parent_id");
  CREATE INDEX "itinerari_locales_parent_id_idx" ON "itinerari_locales" USING btree ("_parent_id");
  CREATE INDEX "luoghi_services_locales_parent_id_idx" ON "luoghi_services_locales" USING btree ("_parent_id");
  CREATE INDEX "luoghi_locales_parent_id_idx" ON "luoghi_locales" USING btree ("_parent_id");
  CREATE INDEX "persone_locales_parent_id_idx" ON "persone_locales" USING btree ("_parent_id");
  CREATE INDEX "residenze_program_locales_parent_id_idx" ON "residenze_program_locales" USING btree ("_parent_id");
  CREATE INDEX "residenze_people_locales_parent_id_idx" ON "residenze_people_locales" USING btree ("_parent_id");
  CREATE INDEX "residenze_locales_parent_id_idx" ON "residenze_locales" USING btree ("_parent_id");
  CREATE INDEX "articoli_locales_parent_id_idx" ON "articoli_locales" USING btree ("_parent_id");
  CREATE INDEX "home_locales_parent_id_idx" ON "home_locales" USING btree ("_parent_id");
  CREATE INDEX "testi_locales_parent_id_idx" ON "testi_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_locales_parent_id_idx" ON "footer_locales" USING btree ("_parent_id");
  CREATE INDEX "chi_siamo_locales_parent_id_idx" ON "chi_siamo_locales" USING btree ("_parent_id");
  CREATE INDEX "mobilita_sostenibile_locales_parent_id_idx" ON "mobilita_sostenibile_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
	await db.execute(sql`
   DROP INDEX "media_locales_parent_id_idx";
  DROP INDEX "video_locales_parent_id_idx";
  DROP INDEX "itinerari_services_locales_parent_id_idx";
  DROP INDEX "itinerari_locales_parent_id_idx";
  DROP INDEX "luoghi_services_locales_parent_id_idx";
  DROP INDEX "luoghi_locales_parent_id_idx";
  DROP INDEX "persone_locales_parent_id_idx";
  DROP INDEX "residenze_program_locales_parent_id_idx";
  DROP INDEX "residenze_people_locales_parent_id_idx";
  DROP INDEX "residenze_locales_parent_id_idx";
  DROP INDEX "articoli_locales_parent_id_idx";
  DROP INDEX "home_locales_parent_id_idx";
  DROP INDEX "testi_locales_parent_id_idx";
  DROP INDEX "footer_locales_parent_id_idx";
  DROP INDEX "chi_siamo_locales_parent_id_idx";
  DROP INDEX "mobilita_sostenibile_locales_parent_id_idx";
  ALTER TABLE "users" DROP COLUMN "reset_password_requested_at";
  ALTER TABLE "media" DROP COLUMN "_objectkey";
  ALTER TABLE "video" DROP COLUMN "_objectkey";
  ALTER TABLE "tracciati" DROP COLUMN "_objectkey";
  ALTER TABLE "social_media" DROP COLUMN "_objectkey";
  ALTER TABLE "social_account" DROP COLUMN "reset_password_requested_at";`)
}
