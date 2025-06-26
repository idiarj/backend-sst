import User from "../models/userModels.js"
import jwtComponent from "../services/jwtComponent.js";
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
                    error: 'Este número de cédula no está vinculado a ningún usuario'
                })
            }

            // Validar contraseña
            const isValidPassword = await User.validatePassword({id_cardNumber, password})
            console.log('isValidPwd', isValidPassword)
            if(!isValidPassword.success){
                return res.status(401).json({
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

            res.cookie('access_token', token, { httpOnly: true, sameSite: 'none', maxAge: 1000 * 60 * 60 * 2 }); // 2 horas

            return res.status(200).json({
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
            //console.log(req)
            const {password, email} = req.body
            const {register_token} = req.cookies
            console.log(req.cookies)
            

            const {id_cardNumber} = jwtComponent.verifyToken({
                token: register_token,
                key: process.env.REGISTER_TOKEN_SECRET
            })
            console.log('Datos de registro: ', id_cardNumber, password)
            console.log('Decoded register token: ', id_cardNumber)

            await User.registerUserPOST({
                id_cardNumber,
                email,
                password
            })

            return res.status(200).json({
                mensaje: `Registro de poseedor de cedula ${id_cardNumber} exitoso`
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
                sameSite: 'none',
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
            const {id_cardNumber, first_name, last_name, email, phone_number} = req.body;
            // console.log(req.body)

            const createUserResult = await User.createUser({
                name: first_name,
                last_name,
                email,
                id_cardNumber,
                phone_number
            })

            console.log(createUserResult)

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

    static async changePassowrd(req, res){
        try {
            const {newPassword} = req.body
            const {result} = await User.changePassword({email: req.user.email, newPassword})
            console.log('Resultado de cambio de contraseña: ', result)


        } catch (error) {
            return res.status(500).json({
                error: 'Error al intentar cambiar la contraseña',
                detalle: error.message
            })
        }
    }
}


export default AuthController;