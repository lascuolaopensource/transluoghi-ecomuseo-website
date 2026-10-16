import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_media" ADD COLUMN "owner_id" integer;
  ALTER TABLE "social_media" ADD CONSTRAINT "social_media_owner_id_social_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."social_account"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "social_media_owner_idx" ON "social_media" USING btree ("owner_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_media" DROP CONSTRAINT "social_media_owner_id_social_account_id_fk";
  
  DROP INDEX "social_media_owner_idx";
  ALTER TABLE "social_media" DROP COLUMN "owner_id";`)
}
