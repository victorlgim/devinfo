CREATE TYPE OS AS ENUM ('Windows', 'Linux', 'MacOS');
CREATE TYPE TECH AS ENUM ('Javascript', 'Python', 'React', 'Express.js', 'HTML',
'CSS', 'Django', 'PostgreSQL', 'MongoDB');

CREATE TABLE developer_infos (
  id SERIAL PRIMARY KEY,
  "developerSince" DATE NOT NULL,
  "preferredOS" OS NOT NULL
);

CREATE TABLE developers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email text UNIQUE NOT NULL,
  "developerInfoId" INTEGER UNIQUE,
  FOREIGN KEY ("developerInfoId") REFERENCES developer_infos (id) ON DELETE CASCADE
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  "estimatedTime" VARCHAR(20) NOT NULL,
  repository  VARCHAR(120) unique NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "developerId" INTEGER NOT NULL,
  FOREIGN KEY ("developerId") REFERENCES developers (id) ON DELETE CASCADE
);

CREATE TABLE technologies (
  id SERIAL PRIMARY KEY,
  name TECH NOT NULL
);

CREATE TABLE projects_technologies (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  "technologyId" INTEGER NOT NULL,
  "addedIn" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("projectId") REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY ("technologyId") REFERENCES technologies (id) ON DELETE CASCADE
);


