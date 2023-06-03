import { describe, it } from "vitest";
import request from "supertest";
import prisma from "../helpers/prisma";
// import { createServer } from "../../../src/server";
// import { PrismaClient } from "@prisma/client";

describe("Data endpoints", () => {

  // beforeAll(async () => {
  //   server = await createServer();
  //   prisma = new PrismaClient();
  // });

  // beforeEach(async () => {
  //   await prisma.$connect();
  // });

  // afterEach(async () => {
  //   await prisma.$disconnect();
  // });

  describe("WEBSITE: Data", () => {
    it("", async () => {
      const username = "admin";
      // const password = bcrypt.hashSync("admin", 10);
      await prisma.user.create({
        data: {
          username: username,
          password: "pippo",
        },
      });
      let users = await prisma.user.count();
      console.log(users);
    });
    // it("WEBSITE: Children elements list api", (done) => {
    //   request(server)
    //     .get(`/children/3123123/%2F`)
    //     .expect(200)
    //     .end((err, res) => {
    //       if (err) return done(err);
    //       done();
    //     });
    // });
  });
});
