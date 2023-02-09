import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";
import {
  Developer,
  DeveloperInfo,
  DeveloperResult,
} from "../interfaces/developer";

export const ensureDeveloperExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { name, email }: Developer = req.body;
  const keys = Object.keys(req.body);

  const validateKeys = ["name", "email"];

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

  const checkExistenceResult: DeveloperResult = await client.query(checkExistenceQueryConfig);

  if (checkExistenceResult.rows.length > 0) {
    return res.status(409).json({ message: "Email already exists." });
  }

  const isValid = keys.every(key => validateKeys.includes(key));

  if (!isValid) {
    res.status(400).json({ message: "invalid input keys" });
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

export const ensureInfoDeveloperExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { developerSince, preferredOS }: DeveloperInfo = req.body;
  const id = req.params.id;
  const keys = Object.keys(req.body);
  const validateKeys = ["developerSince", "preferredOS"];

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

  const checkExistenceResult: DeveloperResult = await client.query(checkExistenceQueryConfig);

  if (!checkExistenceResult.rows.length) {
    return res.status(404).json({ message: "Developer not found" });
  }

  const isValid = keys.every(key => validateKeys.includes(key));

  if (!isValid) {
    res.status(400).json({ message: "invalid input keys" });
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
};
