import express from 'express'
import { router as index_router } from "./routes/index";
import { router as auth_router } from "./routes/auth";
import path, { join } from 'path';
import prisma from './prisma';
import bcrypt from "bcrypt";
import { LoginMiddleware } from './middleware';
const app = express();
const cookieParser = require("cookie-parser");

console.log("Your process id is: " + process.pid);

async function main() {
    // create default admin user if no user exists
    if (await prisma.user.count() == 0) {
        const username = "admin";
        const password = bcrypt.hashSync("admin", 10);
        await prisma.user.create({
            data: {
                username: username,
                password: password,
            }
        });
    }
    
    // static files
    app.use("/static", express.static(join(__dirname, "static")));

    // template engine
    app.set("views", path.join(__dirname, "views"));
    app.set('view engine', 'ejs');

    // middlewares
    app.use(cookieParser());
    app.use(LoginMiddleware);

    // routes
    app.use('', index_router);
    app.use('/auth', auth_router);


    const port = 3000;

    app.listen(port, () => {
        console.log(`server listening on http://localhost:${port}`)
    })
}

main();