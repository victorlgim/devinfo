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
import { Project, ProjectResult } from "../interfaces/project";

export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const getAllInfoQueryString: string = format(`
  SELECT 
  p.id as "projectID", 
  p.name as "projectName", 
  p.description as "projectDescription", 
  p."estimatedTime" as "projectEstimatedTime", 
  p.repository as "projectRepository", 
  p."startDate" as "projectStartDate", 
  p."endDate" as "projectEndDate", 
  p."developerId" as "projectDeveloperID", 
  t.id as "technologyID", 
  t.name as "technologyName"
FROM 
  projects p
LEFT JOIN 
  projects_technologies pt 
ON 
  p.id = pt."projectId"
LEFT JOIN 
  technologies t 
ON 
  pt."technologyId" = t.id
ORDER BY "projectID";
        `);

  const checkExistenceQueryConfig: QueryConfig = {
    text: getAllInfoQueryString,
  };

  const checkExistenceResult: DeveloperResult = await client.query(
    checkExistenceQueryConfig
  );

  return res.status(200).json(checkExistenceResult.rows);
};

export const getProjectById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  const getProjectQueryString: string = format(`
    SELECT 
       p.id as "projectID", 
       p.name as "projectName", 
       p.description as "projectDescription", 
       p."estimatedTime" as "projectEstimatedTime", 
       p.repository as "projectRepository", 
       p."startDate" as "projectStartDate", 
       p."endDate" as "projectEndDate", 
       p."developerId" as "projectDeveloperID", 
       t.id as "technologyID", 
       t.name as "technologyName"
    FROM 
       projects p
    LEFT JOIN 
       projects_technologies pt 
    ON 
       p.id = pt.id
    LEFT JOIN 
       technologies t 
    ON 
       pt.id = t.id
    WHERE 
       p.id = $1
    ORDER BY "projectID";       
    `);

  const getProjectQueryConfig: QueryConfig = {
    text: getProjectQueryString,
    values: [id],
  };

  const getProjectResult: DeveloperResult = await client.query(
    getProjectQueryConfig
  );

  return res.status(200).json(getProjectResult.rows);
};

export const addProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    }: Project = req.body;

    const insertProjectInfoQueryString: string = format(
      `
          INSERT INTO 
             projects ("name", "description", "estimatedTime", "repository", "startDate", "developerId")
          VALUES 
             ($1, $2, $3, $4, $5, (SELECT id FROM developers WHERE id = $6))
          RETURNING *;
        `
    );

    const queryConfig: QueryConfig = {
      text: insertProjectInfoQueryString,
      values: [
        name,
        description,
        estimatedTime,
        repository,
        startDate,
        developerId,
      ],
    };

    const projectInfoResult: ProjectResult = await client.query(queryConfig);

    return res.status(201).json(projectInfoResult.rows[0]);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: "Invalid date format.",
    });
  }
};

export const updateProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  const updateData = { id };
  Object.assign(updateData, req.body);

  const { name, description, estimatedTime, startDate, endDate } = req.body;

  const formatString: string = format(
    `
          UPDATE 
              projects
          SET 
             "name" = COALESCE($1, "name"),
             "description" = COALESCE($2, "description"),
             "estimatedTime" = COALESCE($3, "estimatedTime"),
             "startDate" = COALESCE($4, "startDate"),
             "endDate" = COALESCE($5, "endDate")
          WHERE
              id = $6
          RETURNING 
              *;
      `
  );

  const queryConfig: QueryConfig = {
    text: formatString,
    values: [name, description, estimatedTime, startDate, endDate, id],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);

  return res.status(201).json(queryResult.rows[0]);
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id;

  const deleteDevelopersQueryString: string = `
       DELETE FROM projects
       WHERE id = $1
       RETURNING *;
`;

  await client.query(deleteDevelopersQueryString, [id]);

  return res.status(204).send();
};

export const addTechnologiesProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(req.params.id);

    const { name } = req.body;

    const selectTechnologyIdQueryString = format(
      `
        SELECT id FROM technologies WHERE name = $1
        `
    );

    const selectTechnologyIdQueryConfig = {
      text: selectTechnologyIdQueryString,
      values: [name],
    };

    const selectTechnologyIdResult = await client.query(
      selectTechnologyIdQueryConfig
    );

    let technologyId: number = 0;

    if (selectTechnologyIdResult.rows.length === 0) {
      const insertTechnologyQueryString = format(
        `
          INSERT INTO technologies (name)
          VALUES ($1)
          RETURNING id
          `
      );

      const insertTechnologyQueryConfig = {
        text: insertTechnologyQueryString,
        values: [name],
      };

      const insertTechnologyResult = await client.query(
        insertTechnologyQueryConfig
      );

      technologyId = insertTechnologyResult.rows[0].id;
    } else {
      technologyId = selectTechnologyIdResult.rows[0].id;
    }

    const insertProjectTechnologyQueryString = format(
      `
        INSERT INTO 
        projects_technologies ("projectId", "technologyId", "addedIn")
        VALUES 
        ($1, $2, NOW());
      `
    );

    const queryConfigProjectTechnology = {
      text: insertProjectTechnologyQueryString,
      values: [id, technologyId],
    };

    await client.query(queryConfigProjectTechnology);

    const selectProjectQueryString = format(
      `
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
      `
    );

    const queryConfigProject = {
      text: selectProjectQueryString,
      values: [id],
    };

    const projectResult = await client.query(queryConfigProject);

    return res.status(201).json(projectResult.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteTech = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id = req.params.id;
    const name = req.params.name;

    

    const deleteDevelopersQueryString: string = `
          DELETE 
             FROM 
               projects_technologies
             WHERE 
              "projectId" = $1 AND "technologyId" = (SELECT id FROM technologies WHERE name = $2)
      `;

    const queryConfig: QueryConfig = {
      text: deleteDevelopersQueryString,
      values: [id, name],
    };

    await client.query(queryConfig);

    return res.status(204).send();
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
