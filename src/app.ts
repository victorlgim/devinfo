import express, { Application } from "express";
import developersRoutes from "./routes/developers";
import projectsRoutes from "./routes/projects";
import { startDatabase } from "./database";

const app: Application = express();

app.use(express.json());
app.use("/developers", developersRoutes);
app.use("/projects", projectsRoutes);

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});



