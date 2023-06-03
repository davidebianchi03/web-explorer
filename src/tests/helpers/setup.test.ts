import resetDb from "./reset-db";
import { beforeAll, beforeEach } from "vitest";

beforeAll(() => {
  // change prisma db
  process.env["DATABASE_URL"] =
    "postgresql://postgres:postgres@db:5432/webexplorer";
});

beforeEach(async () => {
  await resetDb();
});
