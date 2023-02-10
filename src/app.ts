import express, { Application } from "express";
import { startDatabase } from "./database";
import { addDeveloper, addDeveloperInfo, deleteDeveloper, getAllDevelopers, getDeveloper, updateDeveloper, updateDeveloperInfo  } from "./logic/developers";
import { ensureDeveloperExists, ensureInfoDeveloperExists, ensureDevelopersRepeatMiddleware, ensureUpdateInfoDeveloperExists, ensureDeveloperIdExists } from "./middlewares/developers.middlewares";

const app: Application = express();

app.use(express.json());


app.get("/developers", getAllDevelopers)
app.get("/developers/:id", ensureDeveloperIdExists, getDeveloper)
app.get("/developers/:id/projects")
app.post("/developers", ensureDeveloperExists, addDeveloper);
app.post("/developers/:id/infos", ensureInfoDeveloperExists, addDeveloperInfo)
app.patch("/developers/:id", ensureDevelopersRepeatMiddleware, updateDeveloper)
app.patch("/developers/:id/infos", ensureUpdateInfoDeveloperExists, updateDeveloperInfo)
app.delete("/developers/:id", ensureDeveloperIdExists, deleteDeveloper)

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
