import User from "../models/userModels.js"
import jwtComponent from "../services/jwtComponent.js";
import iMailer from "../instances/iMailer.js";
import dotenv from 'dotenv';
dotenv.config();

class AuthController{
    static async loginPOST(req, res){
        try {
            const {id_cardNumber, password} = req.body
            console.log('Datos de login: ', id_cardNumber, password)

            console.log('sesion: ',req.cookies)
            if(req.cookies.access_token){
                res.clearCookie('access_token')
                return res.status(403).json({
                    error: 'Ya hay una sesion activa.'
                })
            }

            //Validar nombre de usuario
            const isValidIdCardNumber = await User.validateIdCardNumber({
                id_cardNumber
            })

            
            console.log('isValidIdCardNumber: ', isValidIdCardNumber)
            if(!isValidIdCardNumber.exists){
                return res.status(404).json({
                    success: false,
                    error: 'Este número de cédula no está vinculado a ningún usuario'
                })
            }

            // Validar contraseña
            const isValidPassword = await User.validatePassword({id_cardNumber, password})
            console.log('isValidPwd', isValidPassword)
            if(!isValidPassword.success){
                return res.status(401).json({
                    success: false,
                    error: 'Contraseña incorrecta'
                })
            }

            // Crear sesion con jsonwebtoken
            const userData = isValidIdCardNumber.result[0]; // Extraer el usuario de la base de datos
            const token = jwtComponent.generateToken({
                payload: { id_cardNumber: userData.id_cardNumber }, // Puedes agregar más campos si lo necesitas
                token_key: process.env.ACCESS_TOKEN_SECRET,
                options: { expiresIn: '2h' }
            });

            res.cookie('access_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 2 }); // 2 horas

            return res.status(200).json({
                success: true,
                message: `Login exitoso`
            })
        } catch (error) {
            console.log('Error en login POST: ', error)
            return res.status(500).json({
                error: 'Error al hacer login, por favor intente mas tarde',
                detalle: error.message
            })
        }
    }

    static async registerPOST(req, res){
        try {

            const { email, password } = req.body
            const { register_token } = req.cookies

            console.log('Register token: ', register_token)
            
            const { id_cardNumber } = jwtComponent.verifyToken({
                token: register_token,
                key: process.env.REGISTER_TOKEN_SECRET
            })

            console.log('Datos de registro: ', id_cardNumber, password)
            console.log('Decoded register token: ', id_cardNumber)

            const {status, message, success} = await User.registerUserPOST({
                id_cardNumber,
                email,
                password
            })

            return res.status(status).json({
                success,
                mensaje: message
            })

        } catch (error) {
            console.log('Error en registerPOST: ', error)
            return res.status(500).json({
                error: 'Error al intentar registrarse, por favor intentelo mas tarde',
                detalle: error.message
            })
        }
    }


    static async verifyIdCardNumberPOST(req, res){
        try {
            const {id_cardNumber} = req.body
            console.log('Datos de verificación de cedula: ', id_cardNumber)
            // Validar cedula
            const isValidIdCardNumber = await User.validateIdCardNumber({id_cardNumber})
            console.log('isValidIdCardNumber: ', isValidIdCardNumber)
            if(!isValidIdCardNumber.exists){
                return res.status(404).json({
                    success: false,
                    error: 'Cedula no registrada en el sistema.'
                })
            }

            const registerToken = jwtComponent.generateToken({
                payload: {id_cardNumber},
                token_key: process.env.REGISTER_TOKEN_SECRET,
                options: {expiresIn: '5m'}
            })

            res.cookie('register_token', registerToken, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 5
            })


            return res.status(200).json({
                success: true,
                message: 'Cedula verificada exitosamente.'
            })

        } catch (error) {
            console.log('Error en verifyIdCardNumberPOST: ', error)
            return res.status(500).json({
                error: 'Error al intentar verificar la cedula',
                detalle: error.message
            })
        }
    }

    static async createUserPOST(req, res){
        try {
            const {id_cardNumber, first_name, last_name, phone_number} = req.body;

            const createUserResult = await User.createUser({
                name: first_name,
                last_name,
                id_cardNumber,
                phone_number
            })

            if(!createUserResult.success){
                return res.status(createUserResult.status).json({
                    message: createUserResult.message,
                })
            }

            return res.status(createUserResult.status).json({
                ...createUserResult
            })

        } catch (error) {
            console.log('Error en createUserPOST: ', error);
            return res.status(500).json({
                error: 'Error al intentar crear el usuario',
                detalle: error.message
            })
        }
    }

    static async logout(req, res){
        try {
            console.log(req.cookies)
            const {access_token} = req.cookies
            if(!access_token){
                res.status(200).json({
                    error: 'No hay una sesion activa.'
                })
            }
            console.log('Datos de logout: ', access_token)

            res.clearCookie('access_token');
            console.log(req.cookies)
            return res.status(200).json({
                message: 'Logout exitoso'
            })
        } catch (error) {
            console.error('Error en logoutPOST: ', error)
            return res.status(500).json({
                error: 'Error al intentar hacer logout',
                detalle: error.messagge
            })
        }
    }

    static async forgotPassword(req, res){
        try {
            const {email} = req.body;
            console.log('Datos de verificación de email: ', email)

            // Validar email
            const isValidEmail = await User.validateEmail({email})
            console.log('isValidEmail: ', isValidEmail)
            if(!isValidEmail.exists){
                return res.status(404).json({
                    error: 'Email no registrado en el sistema.'
                })
            }

            // Generar token de verificación
            const verificationToken = jwtComponent.generateToken({
                payload: {email},
                token_key: process.env.VERIFICATION_TOKEN_SECRET,
                options: { expiresIn: '5m' }
            })

            // await iMailer.sendEmail({
            //     from: 'idiar16@gmail.com',
            //     to: email,
            //     subject: 'Solicitud de cambio de contraseña',
            //     text: `<!DOCTYPE html>
            //         <html lang="es">
            //         <head>
            //         <meta charset="UTF-8" />
            //         <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            //         <title>Recuperación de contraseña</title>
            //         <style>
            //             body {
            //             font-family: 'Segoe UI', sans-serif;
            //             background-color: #f4f4f4;
            //             margin: 0;
            //             padding: 0;
            //             }
            //             .container {
            //             background-color: #ffffff;
            //             max-width: 600px;
            //             margin: 40px auto;
            //             border-radius: 10px;
            //             overflow: hidden;
            //             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            //             }
            //             .header {
            //             background-color: #3c558a;
            //             color: white;
            //             padding: 20px;
            //             text-align: center;
            //             }
            //             .header h1 {
            //             margin: 0;
            //             font-size: 20px;
            //             }
            //             .content {
            //             padding: 30px;
            //             color: #333333;
            //             line-height: 1.6;
            //             }
            //             .button {
            //             display: inline-block;
            //             margin-top: 20px;
            //             padding: 12px 20px;
            //             background-color: #faae97;
            //             color: #ffffff;
            //             text-decoration: none;
            //             border-radius: 6px;
            //             font-weight: bold;
            //             }
            //             .footer {
            //             text-align: center;
            //             font-size: 12px;
            //             color: #777777;
            //             padding: 20px;
            //             }
            //         </style>
            //         </head>
            //         <body>
            //         <div class="container">
            //             <div class="header">
            //             <h1>Sistema de Soporte Técnico</h1>
            //             </div>
            //             <div class="content">
            //             <p>Hola,</p>
            //             <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta.</p>
            //             <p>Para cambiar su contraseña, por favor haga clic en el siguiente botón:</p>
            //             <a href="http://localhost:5173/newpassword?${verificationToken}" class="button">Cambiar contraseña</a>
            //             <p>Si usted no solicitó este cambio, puede ignorar este mensaje.</p>
            //             <p>Gracias,<br/>El equipo de soporte técnico</p>
            //             </div>
            //             <div class="footer">
            //             © 2025 Sistema de Soporte Técnico - Todos los derechos reservados.
            //             </div>
            //         </div>
            //         </body>
            //         </html>
            //         .`
            // })

            console.log('Verification token: ', verificationToken)
            await iMailer.sendTemplate({
                from: 'idiar16@gmail.com',
                to: email,
                subject: 'Solicitud de cambio de contraseña',
                template: `<!DOCTYPE html>
                            <html lang="es">
                            <head>
                            <meta charset="UTF-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                            <title>Recuperación de contraseña</title>
                            <style>
                                body {
                                    font-family: 'Segoe UI', sans-serif;
                                    background-color: #f4f4f4;
                                    margin: 0;
                                    padding: 0;
                                }
                                .container {
                                    background-color: #ffffff;
                                    max-width: 600px;
                                    margin: 40px auto;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    background-color: #3c558a;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                }
                                .header h1 {
                                    margin: 0;
                                    font-size: 20px;
                                }
                                .content {
                                    padding: 30px;
                                    color: #333333;
                                    line-height: 1.6;
                                }
                                .button {
                                    display: inline-block;
                                    margin-top: 20px;
                                    padding: 12px 20px;
                                    background-color: #faae97;
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 6px;
                                    font-weight: bold;
                                }
                                .footer {
                                    text-align: center;
                                    font-size: 12px;
                                    color: #777777;
                                    padding: 20px;
                                }
                            </style>
                            </head>
                            <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Sistema de Soporte Técnico</h1>
                                </div>
                                <div class="content">
                                    <p>Hola,</p>
                                    <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta.</p>
                                    <p>Para cambiar su contraseña, por favor haga clic en el siguiente botón:</p>
                                    <a href="http://localhost:5173/newpassword?token=${verificationToken}" class="button">Cambiar contraseña</a>
                                    <p>Si usted no solicitó este cambio, puede ignorar este mensaje.</p>
                                    <p>Gracias,<br/>El equipo de soporte técnico del SAMH</p>
                                </div>
                                <div class="footer">
                                    © 2025 SAMH - Todos los derechos reservados.
                                </div>
                            </div>
                            </body>
                            </html>`
                            });


            return res.status(200).json({
                success: true,
                message: 'Email de recuperacion enviado exitosamente.'
            })

        } catch (error) {
            return res.status(500).json({
                error: 'Error al intentar verificar el email.'
            })
        }
    }

    static async changePassword(req, res){
        try {
            const verification_token = req.headers['authorization'];
            const {newPassword} = req.body;

            console.log('headers:', req.headers)
            console.log(verification_token)
            console.log(newPassword)

            const splittedHeader = verification_token.split(' ');

            console.log('token: ', splittedHeader[1])
            const {email} = jwtComponent.verifyToken({
                token: splittedHeader[1],
                key: process.env.VERIFICATION_TOKEN_SECRET
            })
            //console.log(decoded)

            const {success, message} = await User.changePassword({
                newPassword,
                email
            })

            return res.status(200).json({
                success,
                message
            })
        } catch (error) {
            return res.status(500).json({
                error: 'Error al intentar cambiar la contraseña',
                detalle: error.message
            })
        }
    }
}


export default AuthController;