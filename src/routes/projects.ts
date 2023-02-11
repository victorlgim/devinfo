import { Router } from "express";
import { addProjects, addTechnologiesProjects, deleteProject, deleteTech, getAllProjects, getProjectById, updateProjects } from "../services/projects";
import { ensureProjectExistsMiddleware, ensureProjectsExistsIdMiddleware } from "../middlewares/projects/ensureProjectExists";
import { ensureProjectsExistsDeleteIdMiddleware, ensureProjectsExistsTechnologiesMiddleware, ensureUpdateInfoProjectsExists } from "../middlewares/projects/ensureProjectsRepeat";


const router = Router();

router.get("/", getAllProjects)
router.get("/:id", ensureProjectsExistsIdMiddleware, getProjectById)
router.post("/", ensureProjectExistsMiddleware, addProjects)
router.post("/:id/technologies", ensureProjectsExistsTechnologiesMiddleware, addTechnologiesProjects)
router.patch("/:id", ensureUpdateInfoProjectsExists, updateProjects)
router.delete("/:id", ensureProjectsExistsIdMiddleware, deleteProject)
router.delete("/:id/technologies/:name", ensureProjectsExistsDeleteIdMiddleware, deleteTech)

export default router;