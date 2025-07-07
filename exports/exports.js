import { readJson } from "../utils/readJson.js";

export const querys = readJson('../config/querys.json');
export const local_pg = readJson('../config/local_pg.json');
export const cors_config = readJson('../config/cors_cnf.json')
export const deployed_pg = readJson('../config/deployed_pg.json');