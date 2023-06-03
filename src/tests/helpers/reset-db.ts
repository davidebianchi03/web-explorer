import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async () => {
  console.log("Resetting db changes")
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.session.deleteMany(),
    prisma.connection.deleteMany(),
  ]);
};
