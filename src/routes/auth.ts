import express, { Router } from 'express'
import { join } from 'path';

export const router = Router();

router.use(express.urlencoded({ extended: true }));

router.get("/login", (req, res) => {
    // Authenticate user
    res.sendFile(join(__dirname, "../templates/login.html"));
});

router.post("/login", (req, res) => {
    if(req.body != undefined){
        var username = req.body.username;
        var password = req.body.password;

    } else {
        // error
    }
});