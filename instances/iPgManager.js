import { PgHandler } from "../services/pgManager.js";
import { querys, deployed_pg, local_pg } from "../exports/exports.js";
import dotenv from 'dotenv';
dotenv.config();


const isDeployed = process.env.DEPLOYED_FLAG === 'true';

const pg_config = isDeployed ? deployed_pg : local_pg;


console.log('Estoy en produccion? ', isDeployed )

export const iPgManager = new PgHandler({
    config: pg_config,
    querys: querys
});