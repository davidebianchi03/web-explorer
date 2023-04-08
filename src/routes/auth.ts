import express, { Router } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";

/**
 * Base url: /auth
*/

export const router = Router();

router.use(express.urlencoded({ extended: true }));

/**
 * TODO: use same method for get and post
 * Login
 */
router.get("/login", (req, res) => {
  res.status(200).render("pages/login", {
    errors: {
      username: false,
      password: false,
    },
  });
});

router.post("/login", async (req, res) => {
  if (req.body != undefined) {
    var username = req.body.username;
    var password = req.body.password;
    var user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (user != null) {
      // validate password
      if (bcrypt.compareSync(password, user.password)) {
        // create session
        var session = await prisma.session.create({
          data: {
            user_id: user.id,
            expire: false,
          },
        });

        // set session cookie
        res.cookie("session_id", session.id);
        res.redirect("/");
      } else {
        // TODO: error wrong password
        res.status(200).render("pages/login", {
          errors: {
            username: false,
            password: true,
          },
        });
      }
    } else {
      // TODO: error user does not exists
      res.status(200).render("pages/login");
    }
  } else {
    // TODO: invalid form
    res.status(200).render("pages/login");
  }
});

/**
 * Logout
 */
router.get("/logout", async (req, res) => {
  var session = await prisma.session.findFirst({
    where: {
      id: req.cookies.session_id,
    },
  });
  if(session){
    session.active = false;
  }
  req.cookies.session_id = null;
  
  res.redirect("/auth/login");
});
