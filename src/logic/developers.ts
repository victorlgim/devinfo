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

export const addDeveloper = async ( req: Request, res: Response): Promise<Response> => {
  try {
    const developerData: Developer = req.body;

    const insertDeveloperInfoQueryString: string = format(
      `
        INSERT INTO 
           developers (%I)
        VALUES 
           (%L)
        RETURNING *;
      `,
      Object.keys(developerData),
      Object.values(developerData)
    );

    const developerInfoResult: DeveloperResult = await client.query(
      insertDeveloperInfoQueryString
    );
    console.log(developerInfoResult);
    return res.status(201).json(developerInfoResult.rows[0]);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addDeveloperInfo = async ( req: Request, res: Response): Promise<Response> => {
  try {
    const developerId: number = parseInt(req.params.id);

    const developerInfoData: DeveloperInfo = req.body;

    const insertDeveloperInfoQueryString: string = format(
      `
         INSERT INTO 
           developer_infos (developerSince, preferredOS)
         VALUES 
           ($1, $2)
         RETURNING *;
  `);

      const queryConfig: QueryConfig = {
        text: insertDeveloperInfoQueryString,
        values: [developerInfoData.developerSince, developerInfoData.preferredOS]
    }

    const developerInfoResult: DeveloperInfoResult = await client.query(queryConfig);
  
    const developerInfoId = developerInfoResult.rows[0].id;

    const updateDeveloperQueryString: string = format(
      `
          UPDATE 
            developers 
          SET 
            developerInfoId = $1
          WHERE 
            id = $2 
          RETURNING *;
        `
    );

    const queryConfigDevelopment: QueryConfig = {
        text: updateDeveloperQueryString,
        values: [developerInfoId, developerId]
    }

    const developerResult: DeveloperResult = await client.query(queryConfigDevelopment);
    console.log(developerResult)

    return res.status(201).json(developerResult.rows[0]);
  } catch (error: any) {
   
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
