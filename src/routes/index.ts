import { Router } from 'express'
import { join } from 'path';

export const router = Router();

router.get('/', async (req, res) => {
    // res.status(200).json({message : 'Hello world'})
    res.sendFile(join(__dirname, "../templates/index.html"));
});