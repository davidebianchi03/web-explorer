import { Router } from "express";

export const router = Router();

/**
 * Base url: /data-origin
 */

router.get("/", (req, res) => {
    res.render("pages/data-origin");
})