-- DropForeignKey
ALTER TABLE "authentication_audit" DROP CONSTRAINT "authentication_audit_user_id_fkey";

-- AddForeignKey
ALTER TABLE "authentication_audit" ADD CONSTRAINT "authentication_audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
