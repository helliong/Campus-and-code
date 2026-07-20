CREATE TYPE "CancellationInitiator" AS ENUM ('CUSTOMER', 'STORE');

ALTER TABLE "Order" ADD COLUMN "canceledBy" "CancellationInitiator";

UPDATE "Order"
SET "canceledBy" = 'CUSTOMER'
WHERE "status" IN ('CANCELED', 'REFUNDED');
