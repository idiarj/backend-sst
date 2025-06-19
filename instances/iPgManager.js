import { PgHandler } from "../services/pgManager.js";
import { readJson } from "../utils/readJson.js";

const querys = readJson('../config/querys.json');
const pg_config = readJson('../config/pg_cnf.json');

export const iPgManager = new PgHandler({
    config: pg_config,
    querys: querys
});