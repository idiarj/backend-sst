import { authRouter, reportsRouter, userRouter } from '../routes/dispatcher.js';
import { config } from '../exports/exports.js'; 
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';


console.log(cors_config)
const PORT = config.SERVER_PORT || 3000;
const isServerDeployed = config.SERVER_DEPLOYED_FLAG === 'true';
const url = isServerDeployed ? `https://backend-sst.onrender.com, on port ${PORT}.` : `http://localhost:${PORT}`;

console.log('Estoy con el servidor de produccion?', isServerDeployed);

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(cors_config))

app.use('/auth', authRouter)

app.listen(PORT, ()=>{
    console.log(`Server listening on ${url}`);
})