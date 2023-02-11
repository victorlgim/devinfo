import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../../database";
import { Developer, DeveloperInfo, DeveloperResult } from "../../models/developer/developer";

export const ensureDeveloperExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
        return res.status(409).json({
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
