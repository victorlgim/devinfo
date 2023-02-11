import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";
import {
  Developer,
  DeveloperInfo,
  DeveloperResult,
} from "../interfaces/developer";
import { iDeveloperInfoResultQS } from "../interfaces/developer";

export const ensureDeveloperExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { name, email }: Developer = req.body;

  const checkExistenceQueryString: string = `
          SELECT 
               *
          FROM 
              developers
          WHERE 
              email = $1;
      `;

  const checkExistenceQueryConfig: QueryConfig = {
    text: checkExistenceQueryString,
    values: [email],
  };

  const checkExistenceResult: DeveloperResult = await client.query(
    checkExistenceQueryConfig
  );

  if (checkExistenceResult.rows.length > 0) {
    return res.status(409).json({ message: "Email already exists." });
  }

  if (!name) {
    res.status(400).json({ message: "Missing required keys: name." });
    return;
  }

  if (!email) {
    res.status(400).json({ message: "Missing required keys: email." });
    return;
  }

  if (name) {
    if (typeof name !== "string") {
      res.status(400).json({ message: "invalid 'name' type" });
      return;
    }
  }

  if (email) {
    if (typeof email !== "string") {
      res.status(400).json({ message: "invalid 'email' type" });
      return;
    }
  }

  next();
};

export const ensureDeveloperIdExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = parseInt(req.params.id);

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

  const checkExistenceResult: DeveloperResult = await client.query(
    checkExistenceQueryConfig
  );

  if (!checkExistenceResult.rows.length) {
    return res.status(404).json({ message: "Developer not found" });
  }

  next();
};

export const ensureInfoDeveloperExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { developerSince, preferredOS }: DeveloperInfo = req.body;
    const id = req.params.id;

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

    const checkExistenceResult: DeveloperResult = await client.query(
      checkExistenceQueryConfig
    );

    if (!checkExistenceResult.rows.length) {
      return res.status(404).json({ message: "Developer not found" });
    }

    if (checkExistenceResult.rows.length > 0) {
      if (checkExistenceResult.rows[0].developerInfoId) {
        return res
          .status(409)
          .json({
            message: "The developer already has the registered information.",
          });
      }
    }

    if (!developerSince) {
      res
        .status(400)
        .json({ message: "The field 'developerSince' is required." });
      return;
    }

    if (!preferredOS) {
      res.status(400).json({ message: "The field 'preferredOS' is required." });
      return;
    }

    if (developerSince) {
      if (typeof developerSince !== "string") {
        res.status(400).json({ message: "invalid 'developerSince' type" });
        return;
      }
    }

    if (preferredOS) {
      if (typeof preferredOS !== "string") {
        res.status(400).json({ message: "invalid 'preferredOS' type" });
        return;
      }
    }

    next();
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const ensureDevelopersRepeatMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = parseInt(request.params.id);

  const { name, email } = request.body;

  if (!email && !name) {
    response
      .status(400)
      .json({ message: "You need to insert one of the required fields." });
    return;
  }

  if (name) {
    if (typeof name !== "string") {
      response.status(400).json({ message: "Invalid name type." });
      return;
    }
  }

  if (email) {
    if (typeof email !== "string") {
      response.status(400).json({ message: "Invalid email type." });
      return;
    }
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

  if (email) {
    if (queryResult.rows[0].email === request.body.email) {
      response.status(409).json({ message: `already exists ${email}` });
      return;
    }
  }

  next();
};

export const ensureUpdateInfoDeveloperExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
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
      return res
        .status(404)
        .json({
          message: "The developer has not yet registered the information.",
        });
    }

    if (!preferredOS && !developerSince) {
      res
        .status(400)
        .json({ message: "You need to insert one of the required fields." });
      return;
    }

    if (preferredOS && !validateOS.includes(preferredOS)) {
      res
        .status(400)
        .json({
          message:
            "You need to fill in the preferredOS with one of the types: Windows, Linux or MacOS",
        });
      return;
    }

    if (developerSince && developerSince.length !== 10) {
      res
        .status(400)
        .json({
          message:
            "You need to enter the developerSince type in the following format: 'xxxx-xx-xx'",
        });
      return;
    }

    if (checkExistenceInfoResult.rows[0].preferredOS === preferredOS) {
      res
        .status(409)
        .json({
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
