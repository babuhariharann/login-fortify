import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

/** File imports */
import connection from "./database/connection.js";
import router from "./routes/routes.js";
import bodyParser from "body-parser";

/** app define */

const app = express();

/** middlewares */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");

dotenv.config();

/** PORT Define */

const PORT = process.env.PORT || 8000;
const URL = process.env.MONGO_URL;

connection(URL);

/** api routes */

app.use("/api", router);

/** Server start */

app.listen(PORT, () =>
  console.log(`Successfully server on PORT : http://localhost/${PORT}`)
);
