import express from 'express';
import dotenv from 'dotenv';
import { authRouter } from '../routes/dispatcher.js';
import cookieParser from 'cookie-parser';
import iMailer from '../instances/iMailer.js';
dotenv.config();

const PORT = process.env.PORT || 4000;


const app = express()

app.use(express.json())
app.use(cookieParser())


app.use('/auth',authRouter)


app.get('/sendEmail', async (req, res) => {
    try {
        await iMailer.sendEmail({
            from: 'idiar16@gmail.com',
            to: 'acostavictoria742@gmail.com',
            subject: 'Mamalo victoria',
            text: 'Pero bien mamao mardita'
        })
    } catch (error) {
        res.status(500).json({
            error: 'Error al enviar el email'
        })
    }
})



app.listen(PORT, ()=>{
    console.log(`Server listening on http://localhost:${PORT}`);
})