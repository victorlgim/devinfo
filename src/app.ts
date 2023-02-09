import express, { Application } from "express";
import { startDatabase } from "./database";
import { addDeveloper, addDeveloperInfo  } from "./logic/developers";
import { ensureDeveloperExists, ensureInfoDeveloperExists } from "./middlewares/developers.middlewares";

const app: Application = express();

app.use(express.json());

app.get("/developers")
app.get("/developers:id")
app.get("/developers/:id/projects")
app.post("/developers", ensureDeveloperExists, addDeveloper);
app.post("/developers/:id/infos", ensureInfoDeveloperExists, addDeveloperInfo)
app.patch("/developers/:id")
app.patch("/developers/:id/infos")
app.delete("/developers/:id")

app.get("/projects")
app.get("/projects:id")
app.post("/projects")
app.post("/projects/:id/technologies")
app.patch("/projects/:id")
app.delete("/projects/:id")
app.delete("/projects/:id/technologies/:name")


app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});
