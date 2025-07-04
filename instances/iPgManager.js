import { PgHandler } from "../services/pgManager.js";
import { querys, pg_config } from "../config/exports.js";



export const iPgManager = new PgHandler({
    config: pg_config,
    querys: querys
});