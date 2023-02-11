import { QueryResult } from "pg";

export interface Developer {
  name: string;
  email: string;
}

export interface iDeveloper extends Developer {
  id: number;
  developerInfoId: number;
}

export type DeveloperResult = QueryResult<iDeveloper>;

export interface iDeveloperInfoResult extends iDeveloper {
    developerSince: Date;
    preferredOS: "Windows" | "Linux" | "MacOS";
}

export type iDeveloperInfoResultQS = QueryResult<iDeveloperInfoResult>;

export interface DeveloperInfo {
  developerSince: string;
  preferredOS: "Windows" | "Linux" | "MacOS";
}

export interface iDeveloperInfo extends DeveloperInfo {
  id: number;
}

export type DeveloperInfoResult = QueryResult<iDeveloperInfo>;