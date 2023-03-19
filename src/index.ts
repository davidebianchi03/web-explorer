import express, { Express, Request, Response } from 'express';

// port where server is listening
const port = 3000;

// TODO: load settings from config file

const app: Express = express();

// log process id for an easy debug
console.log("You pid is: " + process.pid);

// handlers

// set static files path
app.use(express.static('pages'));

// start listening for incoming requests
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
