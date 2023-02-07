import express, { Application } from "express";
import { startDatabase } from "./database";
import { addDeveloper } from "./logic/developers";

const app: Application = express();

app.use(express.json());

app.post("/developers", addDeveloper);

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});
