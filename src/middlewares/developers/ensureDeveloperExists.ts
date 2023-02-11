import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "../../database";
import { DeveloperInfo, DeveloperResult } from "../../models/developer/developer";

export const ensureDeveloperExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { name, email } = req.body;

  const checkExistenceQuery = `
    SELECT *
    FROM developers
    WHERE email = $1;
  `;

  const checkExistenceResult = await client.query({
    text: checkExistenceQuery,
    values: [email],
  });

  if (checkExistenceResult.rows.length > 0) {
    return res.status(409).json({ message: 'Email already exists.' });
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Missing required keys: name or invalid name type.' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Missing required keys: email or invalid email type.' });
  }

  next();
};
export const ensureDeveloperIdExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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

export const ensureInfoDeveloperExists = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { developerSince, preferredOS }: DeveloperInfo = req.body;
      const id = req.params.id;
  
      const checkExistenceResult = await client.query(`
        SELECT *
        FROM developers
        WHERE id = $1;
      `, [id]);
  
      if (!checkExistenceResult.rows.length) {
        return res.status(404).json({ message: "Developer not found" });
      }
  
      if (checkExistenceResult.rows[0].developerInfoId) {
        return res.status(409).json({
          message: "The developer already has the registered information.",
        });
      }
  
      if (!developerSince) {
        return res.status(400).json({ message: "The field 'developerSince' is required." });
      }
  
      if (!preferredOS) {
        return res.status(400).json({ message: "The field 'preferredOS' is required." });
      }
  
      if (typeof developerSince !== "string") {
        return res.status(400).json({ message: "invalid 'developerSince' type" });
      }
  
      if (typeof preferredOS !== "string") {
        return res.status(400).json({ message: "invalid 'preferredOS' type" });
      }
  
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };