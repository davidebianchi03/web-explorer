import { Router } from 'express';
export const router = Router();

router.get('/', async (req, res) => {
    // res.status(200).json({message : 'Hello world'})
    res.status(200).render("pages/index");
});