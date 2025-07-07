import express from 'express';
import { authRouter } from '../routes/dispatcher.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { cors_config } from '../exports/exports.js';


const PORT = process.env.PORT || 4000;


const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(cors_config))


app.use('/auth', authRouter)

app.listen(PORT, ()=>{
    console.log(`Server listening on http://localhost:${PORT}`);
})