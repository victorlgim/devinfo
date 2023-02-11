import { Request, Response, NextFunction } from "express";
import { client } from "../../database";
import {  Project } from "../../models/projects/project";

export const ensureUpdateInfoProjectsExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const {
        name,
        description,
        estimatedTime,
        repository,
        startDate,
        endDate,
        developerId,
      }: Project = req.body;
      const id = req.params.id;
  
      const checkExistenceResult = await client.query(
        `SELECT * FROM projects WHERE id = $1`,
        [id]
      );
  
      if (!checkExistenceResult.rows.length) {
        return res.status(409).json({ message: `Project not found` });
      }
  
      const project = checkExistenceResult.rows[0];
      if (
        name &&
        project.name === name ||
        description &&
        project.description === description ||
        estimatedTime &&
        project.estimatedTime === estimatedTime ||
        startDate &&
        project.startDate === startDate ||
        endDate &&
        project.endDate === endDate
      ) {
        return res.status(409).json({
          message: `You are trying to update a value that already exists.`,
        });
      }
  
      if (repository) {
        return res
          .status(400)
          .json({ message: "It is not possible to change a repository." });
      }
  
      if (developerId) {
        return res
          .status(400)
          .json({ message: "It is not possible to update the developerId." });
      }
  
      if (!name && !description && !estimatedTime && !repository && !startDate && !endDate && !developerId) {
        return res
          .status(400)
          .json({ message: "You need to insert one of the required fields." });
      }
  
      const checkTypes = [
        { key: "name", type: "string", value: name },
        { key: "description", type: "string", value: description },
        { key: "estimatedTime", type: "string", value: estimatedTime },
        { key: "repository", type: "string", value: repository },
        { key: "startDate", type: "string", value: startDate },
        { key: "endDate", type: "string", value: endDate },
        { key: "developerId", type: "string", value: developerId },
      ];
  
      for (const item of checkTypes) {
        if (item.value && typeof item.value !== item.type) {
          return res.status(400).json({
            message: `A key '${item.key}' is of type ${item.type}.`,
          });
        }
      }
  
      next();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  export const ensureProjectsExistsTechnologiesMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const supportedTechnologies = [
      "JavaScript",
      "Python",
      "React",
      "Express.js",
      "HTML",
      "CSS",
      "Django",
      "PostgreSQL",
      "MongoDB",
    ];
  
    const queryResult = await client.query({
      text: `
        SELECT
          projects.id AS "projectId",
          projects.name AS "projectName",
          projects.description AS "projectDescription",
          projects."estimatedTime" AS "projectEstimatedTime",
          projects.repository AS "projectRepository",
          projects."startDate" AS "projectStartDate",
          projects."endDate" AS "projectEndDate",
          technologies.id AS "technologyId",
          technologies.name AS "technologyName"
        FROM
          projects
        LEFT JOIN
          projects_technologies
        ON
          projects.id = projects_technologies."projectId"
        LEFT JOIN
          technologies
        ON
          projects_technologies."technologyId" = technologies.id
        WHERE
          projects.id = $1
      `,
      values: [id],
    });
  
    if (queryResult.rows.length > 1) {
      res.status(409).json({
        message: `The logic to check if a specific project already has an inserted technology is correct.`,
      });
      return;
    }
  
    if (!queryResult.rows.length) {
      res.status(404).json({ message: `Project not found` });
      return;
    }
  
    if (name && !supportedTechnologies.includes(name)) {
      res.status(400).json({
        message: "Technology not supported.",
        options: supportedTechnologies,
      });
      return;
    }
  
    next();
  };
  
  export const ensureProjectsExistsDeleteIdMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const name = req.params.name;

    const validateLanguage = [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ];
  
    if (!validateLanguage.includes(name)) {
      return res.status(400).json({
        message: "Technology not supported.",
        options: validateLanguage,
      });
    }
  
    const queryResult = await client.query({
      text: `SELECT * FROM projects WHERE id = $1`,
      values: [id],
    });
  
    if (!queryResult.rows.length) {
      return res.status(404).json({ message: `Project not found` });
    }
  
    const queryResultName = await client.query({
      text: `SELECT * FROM technologies WHERE name = $1`,
      values: [name],
    });
  
    if (!queryResultName.rows.length) {
      return res
        .status(404)
        .json({ message: `Technology ${name} not found on this Project.` });
    }
  
    next();
  };
  