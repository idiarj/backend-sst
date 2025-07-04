import { readJson } from "../utils/readJson.js";

export const querys = readJson('../config/querys.json');
export const pg_config = readJson('../config/pg_cnf.json');
export const cors_config = readJson('../config/cors_cnf.json')