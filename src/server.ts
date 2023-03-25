import express from 'express'
import { router as index_router } from "./routes/index";
import { router as auth_router } from "./routes/auth";
import { join } from 'path';
const app = express()

console.log("Your process id is: " + process.pid);

// routes
app.use('', index_router);
app.use('/auth', auth_router);

// static files
app.use("/static", express.static(join(__dirname, "static")));

const port = 3000;

app.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`)
})