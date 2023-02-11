import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../../database";
import { DeveloperResult } from "../../models/developer/developer";
import { ProjectResult, Project } from "../../models/projects/project";

export const ensureUpdateInfoProjectsExists = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
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
  
      const checkExistenceQueryString: string = `
                      SELECT 
                           *
                      FROM 
                          projects
                      WHERE 
                          id = $1;
                  `;
  
      const checkExistenceQueryConfig: QueryConfig = {
        text: checkExistenceQueryString,
        values: [id],
      };
  
      const checkExistenceResult: ProjectResult = await client.query(
        checkExistenceQueryConfig
      );
  
      if (!checkExistenceResult.rows.length) {
        res.status(409).json({ message: `Project not found` });
        return;
      }
  
      if (name && checkExistenceResult.rows[0].name === name) {
        res.status(409).json({
          message: `You are trying to update the value 'name: ${name}' that already exists.`,
        });
        return;
      }
  
      if (
        description &&
        checkExistenceResult.rows[0].description === description
      ) {
        res.status(409).json({
          message: `You are trying to update the value 'description: ${description}' that already exists.`,
        });
        return;
      }
  
      if (
        estimatedTime &&
        checkExistenceResult.rows[0].estimatedTime === estimatedTime
      ) {
        res.status(409).json({
          message: `You are trying to update the value 'estimatedTime: ${estimatedTime}' that already exists.`,
        });
        return;
      }
  
      if (startDate && checkExistenceResult.rows[0].startDate === startDate) {
        res.status(409).json({
          message: `You are trying to update the value 'startDate: ${startDate}' that already exists.`,
        });
        return;
      }
  
      if (endDate && checkExistenceResult.rows[0].endDate === endDate) {
        res.status(409).json({
          message: `You are trying to update the value 'endDate: ${endDate}' that already exists.`,
        });
        return;
      }
  
      if (repository) {
        res
          .status(400)
          .json({ message: "It is not possible to change a repository." });
        return;
      }
  
      if (developerId) {
        res
          .status(400)
          .json({ message: "It is not possible to update the developerId." });
        return;
      }
  
      if (
        !name &&
        !description &&
        !estimatedTime &&
        !repository &&
        !startDate &&
        !endDate &&
        !developerId
      ) {
        res
          .status(400)
          .json({ message: "You need to insert one of the required fields." });
        return;
      }
  
      if (name && typeof name !== "string") {
        res.status(400).json({ message: "A key 'name' is of type string." });
        return;
      }
  
      if (description && typeof description !== "string") {
        res
          .status(400)
          .json({ message: "A key 'description' is of type string." });
        return;
      }
      if (estimatedTime && typeof estimatedTime !== "string") {
        res
          .status(400)
          .json({ message: "A key 'estimatedTime is of type string." });
        return;
      }
      if (repository && typeof repository !== "string") {
        res.status(400).json({ message: "A key 'repository is of type string." });
        return;
      }
      if (startDate && typeof startDate !== "string") {
        res.status(400).json({ message: "A key 'startDate' is of type string." });
        return;
      }
      if (endDate && typeof endDate !== "string") {
        res.status(400).json({ message: "A key 'endDate' is of type string." });
        return;
      }
      if (developerId && typeof developerId !== "string") {
        res.status(400).json({
          message:
            "You need to enter the developerSince type in the following format: 'xxxx-xx-xx'",
        });
        return;
      }
  
      next();
    } catch (error: any) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
  
  export const ensureProjectsExistsTechnologiesMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const id: number = parseInt(req.params.id);
    const { name } = req.body;
  
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
  
    const queryString: string = `
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
          `;
  
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
  
    const queryResult: ProjectResult = await client.query(queryConfig);
    console.log(queryResult.rows);
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
  
    if (name && !validateLanguage.includes(name)) {
      res.status(400).json({
        message: "Technology not supported.",
        options: [
          "JavaScript",
          "Python",
          "React",
          "Express.js",
          "HTML",
          "CSS",
          "Django",
          "PostgreSQL",
          "MongoDB",
        ],
      });
      return;
    }
  
    next();
  };
  
  export const ensureProjectsExistsDeleteIdMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const id: any = req.params.id;
  
    const name: string = req.params.name;
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
    if (name && !validateLanguage.includes(name)) {
      res.status(400).json({
        message: "Technology not supported.",
        options: [
          "JavaScript",
          "Python",
          "React",
          "Express.js",
          "HTML",
          "CSS",
          "Django",
          "PostgreSQL",
          "MongoDB",
        ],
      });
      return;
    }
    const queryString: string = `
              SELECT
                  *
              FROM
                  projects
              WHERE
                  id = $1;
          `;
  
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
  
    const queryStringName: string = `
               SELECT 
                   *
               FROM 
                   technologies 
               WHERE 
                   name = $1;
          `;
  
    const queryConfigName: QueryConfig = {
      text: queryStringName,
      values: [name],
    };
  
    const queryResult: DeveloperResult = await client.query(queryConfig);
    const queryResultName: DeveloperResult = await client.query(queryConfigName);
  
    if (!queryResult.rows.length) {
      res.status(404).json({ message: `Project not found` });
      return;
    }
  
    if (!queryResultName.rows.length) {
      res
        .status(404)
        .json({ message: `Technology ${name} not found on this Project.` });
      return;
    }
  
    next();
  };
  