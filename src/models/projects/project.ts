import { QueryResult } from "pg";

export interface Project {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate?: Date;
  developerId: number;
}

export interface iProjectTech extends Project {
    technologyName: string;
}

export interface ErrorMessages {
    name: string;
    description: string;
    estimatedTime: string;
    repository: string;
    startDate: string;
    developerId: string;
  }

export type iErrorMessages = Array<ErrorMessages>
  
export type ProjectResult = QueryResult<iProjectTech>;