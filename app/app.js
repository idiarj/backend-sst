import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter, reportsRouter } from '../routes/dispatcher.js';
import { cors_config } from '../exports/exports.js';


const PORT = process.env.PORT || 4000;
const isServerDeployed = process.env.DEPLOYED_SERVER_FLAG

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(cors_config))


const url = isServerDeployed === 'true' ? `https://backend-sst.onrender.com, on port ${PORT}` : `http:localhost:${PORT}`;

app.use('/auth', authRouter)

app.listen(PORT, ()=>{
    console.log(`Server listening on ${url}`);
})