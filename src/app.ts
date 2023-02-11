import express, { Application } from "express";
import { startDatabase } from "./database";
import { addDeveloper, addDeveloperInfo, deleteDeveloper, getAllDevelopers, getDeveloper, updateDeveloper, updateDeveloperInfo  } from "./logic/developers";
import { addProjects, addTechnologiesProjects, deleteProject, deleteTech, getAllProjects, getProjectById, updateProjects } from "./logic/projects";
import { ensureDeveloperExists, ensureInfoDeveloperExists, ensureDevelopersRepeatMiddleware, ensureUpdateInfoDeveloperExists, ensureDeveloperIdExists } from "./middlewares/developers.middlewares";
import { ensureProjectExistsMiddleware, ensureProjectsExistsDeleteIdMiddleware, ensureProjectsExistsIdMiddleware, ensureProjectsExistsTechnologiesMiddleware, ensureUpdateInfoProjectsExists } from "./middlewares/projects.middlewares";


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

app.get("/projects", getAllProjects)
app.get("/projects/:id", ensureProjectsExistsIdMiddleware, getProjectById)
app.post("/projects", ensureProjectExistsMiddleware, addProjects)
app.post("/projects/:id/technologies", ensureProjectsExistsTechnologiesMiddleware, addTechnologiesProjects)
app.patch("/projects/:id", ensureUpdateInfoProjectsExists, updateProjects)
app.delete("/projects/:id", ensureProjectsExistsIdMiddleware, deleteProject)
app.delete("/projects/:id/technologies/:name", ensureProjectsExistsDeleteIdMiddleware, deleteTech)

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});
