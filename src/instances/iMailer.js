import Mailer from "../services/Mailer.js";
import { config } from "../exports/exports.js";


const iMailer = new Mailer({
    user: `idiar16@gmail.com`,
    pass: config.APP_PASSWORD_EMAIL
}, true)

export default iMailer;