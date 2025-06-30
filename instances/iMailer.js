import Mailer from "../services/Mailer.js";
import dotenv from 'dotenv';

dotenv.config();



const iMailer = new Mailer({
    user: `idiar16@gmail.com`,
    pass: process.env.APP_PASSWORD_EMAIL
}, true)

export default iMailer;