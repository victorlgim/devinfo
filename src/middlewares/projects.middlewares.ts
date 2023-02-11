import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import { DeveloperResult,} from "../interfaces/developer";
import { ProjectResult, Project } from "../interfaces/project";

export const ensureProjectExistsMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const { name, description, estimatedTime, repository, startDate, developerId } = req.body

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

  const checkExistenceResult: DeveloperResult = await client.query(checkExistenceQueryConfig);

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

  const checkExistenceResultProject: ProjectResult = await client.query(checkExistenceQueryConfigProject);

  if (!checkExistenceResult.rows.length) {
    return res.status(404).json({ message: "Developer not found" });
  }

console.log(checkExistenceResultProject.rows.length)

  if (checkExistenceResultProject.rows.length > 0) {

    if(checkExistenceResultProject.rows[0].repository === repository) {
      return res.status(409).json({ message: "This repository is already in use." });
    }

  }

  next()
}

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

export const ensureUpdateInfoProjectsExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { name, description, estimatedTime, repository, startDate, endDate, developerId }: Project = req.body;
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
  
     
      const checkExistenceResult: ProjectResult = await client.query(checkExistenceQueryConfig);
       
      
      if (name && checkExistenceResult.rows[0].name === name) {
        res.status(409).json({ message: `You are trying to update the value 'name: ${name}' that already exists.`});
        return;
      }

      if (description && checkExistenceResult.rows[0].description === description) {
        res.status(409).json({ message: `You are trying to update the value 'description: ${description}' that already exists.`});
        return;
      }

      if (estimatedTime && checkExistenceResult.rows[0].estimatedTime === estimatedTime) {
        res.status(409).json({ message: `You are trying to update the value 'estimatedTime: ${estimatedTime}' that already exists.`});
        return;
      }

      if (startDate && checkExistenceResult.rows[0].startDate === startDate) {
        res.status(409).json({ message: `You are trying to update the value 'startDate: ${startDate}' that already exists.`});
        return;
      }

      if (endDate && checkExistenceResult.rows[0].endDate === endDate) {
        res.status(409).json({ message: `You are trying to update the value 'endDate: ${endDate}' that already exists.`});
        return;
      }
     
      if (repository) {
        res.status(400).json({ message: "It is not possible to change a repository." });
        return;  
      }

      if (developerId) {
        res.status(400).json({ message: "It is not possible to update the developerId." });
        return;  
      }
  
      if (!name && !description && !estimatedTime && !repository && !startDate && !endDate && !developerId) {
          res.status(400).json({ message: "You need to insert one of the required fields." });
          return;
      }
  
      if (name && typeof name !== "string") {
          res.status(400).json({ message: "A key 'name' is of type string." });
          return;
      }
  
      if (description && typeof description !== "string") {
        res.status(400).json({ message: "A key 'description' is of type string." });
        return;
    }
     if (estimatedTime && typeof estimatedTime !== "string") {
          res.status(400).json({ message: "A key 'estimatedTime is of type string." });
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
          res.status(400).json({ message: "You need to enter the developerSince type in the following format: 'xxxx-xx-xx'" });
          return;
      }
  
  
      next();
    } catch (error: any) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };