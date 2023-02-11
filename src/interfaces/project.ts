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

export type ProjectResult = QueryResult<Project>

export interface ProjectTechnology {
  id: number;
  addedIn: Date;
  projectId: number;
  technologyId: number;
}

export interface Technology {
  id: number;
  name: string;
}
