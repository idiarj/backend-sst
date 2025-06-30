import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

class Mailer {
    constructor(auth, secure){
        this.auth = auth 
        this.secure = secure
    }

    async createTransport(){
        try {
            let port = this.secure ? 465 : 587;
            console.log(port)
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port, // Usar 465 para SSL o 587 para TLS
                secure: this.secure, // true para 465, false para 587
                auth: this.auth,
              })
            return transporter;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async sendEmail({from, to, subject, text, attachments = []}) {
        try {
            console.log(from, to, subject, text, attachments);
            const transporter = await this.createTransport();
            const info = await transporter.sendMail({
                from,
                to,
                subject,
                text,
                attachments // Añadimos la propiedad attachments
            });
            console.log('Correo enviado con éxito:', info.response);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async sendTemplate({from, to, subject, template, attachments = []}) {
        try {
            console.log(from, to, subject, template);
            const transporter = await this.createTransport();
            const info = await transporter.sendMail({
                from,
                to,
                subject,
                html: template,
                attachments
            });
            console.log('Correo enviado con éxito:', info.response);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}


export default Mailer;