import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../../database";
import { DeveloperInfo, DeveloperResult } from "../../models/developer/developer";
import { iDeveloperInfoResultQS } from "../../models/developer/developer";


export const ensureDevelopersRepeatMiddleware = async ( request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  const id: number = parseInt(request.params.id);
  const { name, email } = request.body;

  if (!email && !name) {
    return response.status(400).json({ message: "You need to insert one of the required fields." });
  }

  if (name && typeof name !== "string") {
    return response.status(400).json({ message: "Invalid name type." });
  }

  if (email && typeof email !== "string") {
    return response.status(400).json({ message: "Invalid email type." });
  }

  const queryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);

  if (!queryResult.rows.length) {
    return response.status(404).json({ message: "Developer not found" });
  }

  if (email && queryResult.rows[0].email === email) {
    return response.status(409).json({ message: `Email already exists: ${email}` });
  }

  if (name && queryResult.rows[0].name === name) {
    return response.status(409).json({ message: `Name already exists: ${name}` });
  }

  next();
};
  
  export const ensureUpdateInfoDeveloperExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { developerSince, preferredOS }: DeveloperInfo = req.body;
      const id = req.params.id;
      const validateOS = ["Windows", "Linux", "MacOS"];
  
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
        values: [id],
      };
  
      const checkExistenceInfoString: string = `
       SELECT 
           d.id, d.name, d.email, di."preferredOS"
       FROM
           developers d 
       JOIN
           developer_infos di 
       ON 
           d."developerInfoId" = di.id 
       WHERE 
           d.id = $1
        `;
  
      const checkExistenceInfoQueryString: QueryConfig = {
        text: checkExistenceInfoString,
        values: [id],
      };
  
      const checkExistenceResult: DeveloperResult = await client.query(
        checkExistenceQueryConfig
      );
      const checkExistenceInfoResult: iDeveloperInfoResultQS = await client.query(
        checkExistenceInfoQueryString
      );
  
      if (checkExistenceResult.rows.length === 0) {
        return res.status(404).json({ message: "Developer not found" });
      }
  
      if (checkExistenceInfoResult.rows.length === 0) {
        return res.status(404).json({
            message: "The developer has not yet registered the information.",
          });
      }
  
      if (!preferredOS && !developerSince) {
        res.status(400).json({ message: "You need to insert one of the required fields." });
        return;
      }
  
      if (preferredOS && !validateOS.includes(preferredOS)) {
        res.status(400).json({
            message:
              "You need to fill in the preferredOS with one of the types: Windows, Linux or MacOS",
          });
        return;
      }
  
      if (developerSince && developerSince.length !== 10) {
        res.status(400).json({
            message:
              "You need to enter the developerSince type in the following format: 'xxxx-xx-xx'",
          });
        return;
      }
  
      if (checkExistenceInfoResult.rows[0].preferredOS === preferredOS) {
        res.status(409).json({
            message: `already exists ${preferredOS} in ${checkExistenceInfoResult.rows[0].email}`,
          });
        return;
      }
  
      if (preferredOS && typeof preferredOS !== "string") {
        res.status(400).json({ message: "preferredOS invalid type." });
        return;
      }
  
      if (developerSince && typeof developerSince !== "string") {
        res.status(400).json({ message: "developerSince invalid type." });
        return;
      }
  
      next();
    } catch (error: any) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };