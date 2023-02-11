import { Request, Response } from "express";
import format from "pg-format";
import {
  Developer,
  DeveloperResult,
  DeveloperInfo,
  DeveloperInfoResult,
} from "../interfaces/developer";
import { QueryConfig } from "pg";
import { client } from "../database";

export const getAllDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const getProjectsQueryString: string = format(`
    SELECT 
    developers.id AS "developerID", 
    developers.name AS "developerName", 
    developers.email AS "developerEmail", 
    developer_infos.id AS "developerInfoID",
    developer_infos."developerSince" AS "developerInfoDeveloperSince", 
    developer_infos."preferredOS" AS "developerInfoPreferredOS" FROM developers
 LEFT JOIN 
    developer_infos ON developers."developerInfoId" = developer_infos.id
      ORDER BY 
         developers.id;
    `);

  const getProjectsResult: any = await client.query(getProjectsQueryString);

  return res.status(200).json(getProjectsResult.rows);
};

export const getDeveloperAndProjects = async ( req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
  
    const getDevelopersQueryString: string = `
    SELECT developers.id AS "developerID",
    developers.name AS "developerName",
    developers.email AS "developerEmail",
    developer_infos.id AS "developerInfoID",
    developer_infos."developerSince" AS "developerInfoDeveloperSince",
    developer_infos."preferredOS" AS "developerInfoPreferredOS",
    projects.id AS "projectID",
    projects.name AS "projectName",
    projects.description AS "projectDescription",
    projects."estimatedTime" AS "projectEstimatedTime",
    projects.repository AS "projectRepository",
    projects."startDate" AS "projectStartDate",
    projects."endDate" AS "projectEndDate",
    technologies.id AS "technologyId",
    technologies.name AS "technologyName"
FROM developers
JOIN developer_infos ON developers."developerInfoId" = developer_infos.id
JOIN projects ON developers.id = projects."developerId"
LEFT JOIN projects_technologies ON projects.id = projects_technologies."projectId"
LEFT JOIN technologies ON projects_technologies."technologyId" = technologies.id
WHERE developers.id = $1
ORDER BY projects.id, technologies.id
     `;
  
    const checkExistenceQueryConfig: QueryConfig = {
      text: getDevelopersQueryString,
      values: [id],
    };
  
    const checkExistenceResult: DeveloperResult = await client.query(
      checkExistenceQueryConfig.text,
      [id]
    );
  
    return res.status(200).json(checkExistenceResult.rows[0]);
  };


export const getDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;

  const getDevelopersQueryString: string = `
    SELECT 
       developers.id AS "developerID", 
       developers.name AS "developerName", 
       developers.email AS "developerEmail", 
       developer_infos.id AS "developerInfoID",
       developer_infos."developerSince" AS "developerInfoDeveloperSince", 
       developer_infos."preferredOS" AS "developerInfoPreferredOS" FROM developers
    LEFT JOIN 
       developer_infos ON developers."developerInfoId" = developer_infos.id
    WHERE 
       developers.id = $1;  
   `;

  const checkExistenceQueryConfig: QueryConfig = {
    text: getDevelopersQueryString,
    values: [id],
  };

  const checkExistenceResult: DeveloperResult = await client.query(
    checkExistenceQueryConfig.text,
    [id]
  );

  return res.status(200).json(checkExistenceResult.rows[0]);
};

export const addDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email }: Developer = req.body;

    const insertDeveloperInfoQueryString: string = format(
      `
        INSERT INTO 
           developers ("name", "email")
        VALUES 
           ($1, $2)
        RETURNING *;
      `
    );

    const queryConfig: QueryConfig = {
      text: insertDeveloperInfoQueryString,
      values: [name, email],
    };

    const developerInfoResult: DeveloperResult = await client.query(
      queryConfig
    );

    return res.status(201).json(developerInfoResult.rows[0]);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addDeveloperInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const developerId: number = parseInt(req.params.id);

    const developerInfoData: DeveloperInfo = req.body;

    const insertDeveloperInfoQueryString: string = format(
      `
         INSERT INTO 
           developer_infos ("developerSince", "preferredOS")
         VALUES 
           ($1, $2)
         RETURNING *;
  `
    );

    const queryConfig: QueryConfig = {
      text: insertDeveloperInfoQueryString,
      values: [developerInfoData.developerSince, developerInfoData.preferredOS],
    };

    const developerInfoResult: DeveloperInfoResult = await client.query(
      queryConfig
    );

    const developerInfoId = developerInfoResult.rows[0].id;

    const updateDeveloperQueryString: string = format(
      `
          UPDATE 
            developers 
          SET 
            "developerInfoId" = $1
          WHERE 
            id = $2 
          RETURNING *;
        `
    );

    const queryConfigDevelopment: QueryConfig = {
      text: updateDeveloperQueryString,
      values: [developerInfoId, developerId],
    };

    const developerResult: DeveloperResult = await client.query(
      queryConfigDevelopment
    );

    return res.status(201).json(developerResult.rows[0]);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, email } = req.body;
  try {
    const id: number = parseInt(req.params.id);

    const updateData = { id };
    Object.assign(updateData, req.body);

    const formatString: string = format(
      `
              UPDATE 
                  developers 
              SET 
                 "name" = COALESCE($1, "name"),
                 "email" = COALESCE($2, "email")
              WHERE
                  id = $3
              RETURNING *;
          `
    );

    const queryConfig: QueryConfig = {
      text: formatString,
      values: [name, email, id],
    };

    const queryResult: DeveloperResult = await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    return res.status(409).json({ message: `already exists ${email}` });
  }
};

export const updateDeveloperInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(req.params.id);

    const { developerSince, preferredOS } = req.body;

    const formatString: string = format(
      `
      UPDATE
         developer_infos
      SET
        "developerSince" = COALESCE($1, "developerSince"),
        "preferredOS" = COALESCE($2, "preferredOS")
      WHERE
        id = (SELECT "developerInfoId" FROM developers WHERE id = $3)
      RETURNING *;
    `
    );

    const queryConfig: QueryConfig = {
      text: formatString,
      values: [developerSince, preferredOS, id],
    };

    const queryResult: DeveloperResult = await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;

  const deleteDevelopersQueryString: string = `
       DELETE FROM developers
       WHERE id = $1
       RETURNING *;
`;

  await client.query(deleteDevelopersQueryString, [id]);

  return res.status(204).send();
};
