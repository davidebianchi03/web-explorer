import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();
// create express app
var express_app = createApp(
  process.env.REACT_APP_ENVIRONMENT === "develop" ? false : true
);
express_app.listen(process.env.REACT_APP_SERVER_PORT);
console.log(`Server is listening at ${process.env.REACT_APP_SERVER_PORT}`)
