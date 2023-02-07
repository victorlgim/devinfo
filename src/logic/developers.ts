import { Request, Response } from "express";
import format from "pg-format";
import { Developer, DeveloperResult } from "../interfaces/developer";
import { QueryConfig } from "pg";
import { client } from "../database";

export const addDeveloper = async (req: Request, res: Response): Promise<Response> => {
  const developerData: Developer = req.body;

  const checkExistenceQueryString: string = `
        SELECT *
        FROM developers
        WHERE name = $1;
    `;

  const checkExistenceQueryConfig: QueryConfig = {
    text: checkExistenceQueryString,
    values: [developerData.name],
  };

  try {
    const checkExistenceResult: DeveloperResult = await client.query(
      checkExistenceQueryConfig
    );

    if (checkExistenceResult.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "this item already exists in the list" });
    }

    const queryString: string = format(
      `
              INSERT INTO
                  mechanics (%I)
              VALUES (%L)
              RETURNING *;
            `,
      Object.keys(developerData),
      Object.values(developerData)
    );

    const queryResult: DeveloperResult = await client.query(queryString);
    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
