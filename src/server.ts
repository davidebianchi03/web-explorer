import express from 'express'
import { Router } from 'express'

const app = express()
const router = Router()

console.log("Your process id is: " + process.pid)

router.get('/', async(req, res)=>{
    res.status(200).json({message : 'Hello world'})
})

app.use('/api', router)

const port = 3000

app.listen(port, ()=>{
    console.log(`server listening on http://localhost:${port}f`)
})