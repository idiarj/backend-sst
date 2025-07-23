import { readJson } from "../utils/readJson.js";
import dotenv from "dotenv";
dotenv.config();

export const config = {
    SERVER_PORT: process.env.SERVER_PORT,
    ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_SECRET,
    REGISTER_TOKEN_KEY: process.env.REGISTER_TOKEN_SECRET,
    VERIFICATION_TOKEN_KEY: process.env.VERIFICATION_TOKEN_SECRET,
    APP_PASSWORD_EMAIL: process.env.APP_PASSWORD_EMAIL,
    DB_DEPLOYED_FLAG: process.env.DEPLOYED_DB_FLAG,
    SERVER_DEPLOYED_FLAG: process.env.DEPLOYED_SERVER_FLAG,
    local_db: {
	"user": process.env.USER_DB,
	"host": process.env.HOST_DB,
	"database": process.env.DB_NAME,
	"password": process.env.DB_PASSWORD,
	"port": process.env.DB_PORT
    },
    deployed_db: {
        "connectionString": process.env.DEPLOYED_DB_CNN_STRING,
        "ssl": { "rejectUnauthorized": process.env.REJECT_UNAUTHORIZED_SSL === 'true' }
    },
    querys: readJson('../config/querys.json'),
    cors_config: readJson('../config/cors_cnf.json')
}

console.log('Config loaded:', config);

//console.log(config);

// export const querys = readJson('../config/querys.json');
// export const local_pg = readJson('../config/local_pg.json');
// export const cors_config = readJson('../config/cors_cnf.json')
// export const deployed_pg = readJson('../config/deployed_pg.json');