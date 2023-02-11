import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../../database";
import { DeveloperResult } from "../../models/developer/developer";
import { ProjectResult } from "../../models/projects/project";

export const ensureProjectExistsMiddleware = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    } = req.body;
  
    if (!name) {
      res.status(400).json({ message: "The field 'name' is required." });
      return;
    }
    if (!description) {
      res.status(400).json({ message: "The field 'description' is required." });
      return;
    }
    if (!estimatedTime) {
      res.status(400).json({ message: "The field 'estimatedTime' is required." });
      return;
    }
    if (!repository) {
      res.status(400).json({ message: "The field 'repository' is required." });
      return;
    }
    if (!startDate) {
      res.status(400).json({ message: "The field 'startDate' is required." });
      return;
    }
  
    if (!developerId) {
      res.status(400).json({ message: "The field 'developerId' is required." });
      return;
    }
  
    const checkExistenceQueryString: string = `
            SELECT 
                 *
            FROM 
                developers
            WHERE 
                id = $1;
        `;
  
    const checkExistenceQueryConfig: QueryConfig = {
      text: checkExistenceQueryString,
      values: [developerId],
    };
  
    const checkExistenceResult: DeveloperResult = await client.query(
      checkExistenceQueryConfig
    );
  
    const checkExistenceQueryStringProject: string = `
            SELECT 
                 *
            FROM 
                projects
            WHERE 
               "developerId" = $1 OR name = $2 OR repository = $3
        `;
  
    const checkExistenceQueryConfigProject: QueryConfig = {
      text: checkExistenceQueryStringProject,
      values: [developerId, name, repository],
    };
  
    const checkExistenceResultProject: ProjectResult = await client.query(
      checkExistenceQueryConfigProject
    );
  
    if (!checkExistenceResult.rows.length) {
      return res.status(404).json({ message: "Developer not found" });
    }
  
    if (checkExistenceResultProject.rows.length > 0) {
      if (checkExistenceResultProject.rows[0].repository === repository) {
        return res
          .status(409)
          .json({ message: "This repository is already in use." });
      }
    }
  
    next();
  };
  
export const ensureProjectsExistsIdMiddleware = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const id: number = parseInt(req.params.id);

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

  const queryResult: DeveloperResult = await client.query(queryConfig);

  if (!queryResult.rows.length) {
    res.status(409).json({ message: `Project not found` });
    return;
  }

  next();
};