import { Router } from "express";
import { addDeveloper, addDeveloperInfo, deleteDeveloper, getAllDevelopers, getDeveloper, getDeveloperAndProjects, updateDeveloper, updateDeveloperInfo } from "../logic/developers";
import { ensureDeveloperExists, ensureDeveloperIdExists, ensureInfoDeveloperExists } from "../middlewares/developers/ensureDeveloperExists";
import { ensureDevelopersRepeatMiddleware, ensureUpdateInfoDeveloperExists } from "../middlewares/developers/ensureDevelopersRepeat";

const router = Router();

router.get("/", getAllDevelopers)
router.get("/:id", ensureDeveloperIdExists, getDeveloper)
router.get("/:id/projects", ensureDeveloperIdExists, getDeveloperAndProjects)
router.post("/", ensureDeveloperExists, addDeveloper);
router.post("/:id/infos", ensureInfoDeveloperExists, addDeveloperInfo)
router.patch("/:id", ensureDevelopersRepeatMiddleware, updateDeveloper)
router.patch("/:id/infos", ensureUpdateInfoDeveloperExists, updateDeveloperInfo)
router.delete("/:id", ensureDeveloperIdExists, deleteDeveloper)

export default router;