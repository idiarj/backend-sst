import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter, reportsRouter } from '../routes/dispatcher.js';
import { cors_config } from '../exports/exports.js';

console.log(cors_config)
const PORT = process.env.PORT || 4000;
const isServerDeployed = process.env.DEPLOYED_SERVER_FLAG === 'true';
const url = isServerDeployed ? `https://backend-sst.onrender.com, on port ${PORT}.` : `http:localhost:${PORT}`;

console.log('Estoy con el servidor de produccion?', isServerDeployed);

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(cors_config))

app.use('/auth', authRouter)

app.listen(PORT, ()=>{
    console.log(`Server listening on ${url}`);
})