import { QueryResult } from 'pg'

export interface Developer {
  name: string;
  email: string;
}


export interface iDeveloper extends Developer {
  id: number;
  developerInfoId: number;
}

export type DeveloperResult = QueryResult<iDeveloper>

export interface DeveloperInfo {
  id: number;
  developerSince: Date;
  preferredOS: "Windows" | "Linux" | "MacOS";
}
