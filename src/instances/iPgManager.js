import { PgHandler } from "../services/pgManager.js";
import { config } from "../exports/exports.js";



const isDeployed = config.DB_DEPLOYED_FLAG === 'true';

const pg_config = isDeployed ? config.deployed_db : config.local_db ;


console.log('Estoy conectado a la base de datos desplegada? ', isDeployed )

export const iPgManager = new PgHandler({
    config: pg_config,
    querys: config.querys
});