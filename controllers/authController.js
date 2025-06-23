

import User from "../models/userModels.js"
import sessionManager  from "../services/sessionManager.js"
import dotenv from 'dotenv';
dotenv.config();

class AuthController{
    static async loginPOST(req, res){
        try {
            const {email, password} = req.body
            console.log('Datos de login: ', email, password)


            //Validar nombre de usuario
            const isValidEmail = await User.validateEmail({email})
            console.log('isValidEmail: ', isValidEmail)
            if(!isValidEmail.success){
                return res.status(404).json({
                    error: 'Este correo no esta vinculado a ningun usuario'
                })
            }
            //Validar contraseña
            const isValidPassword = await User.validatePassword({email, password})
            if(!isValidPassword){
                return res.status(401).json({
                    error: 'Contraseña incorrecta'
                })
            }

            // Crear sesion con jsonwebtoken
            console.log('payload: ', isValidEmail.result)
            const {access_token} = sessionManager.createSession({payload: isValidEmail.result, access_token_key: process.env.ACCES_TOKEN_SECRET})

            res.cookie('access_token', access_token, {httpOnly: true, sameSite: 'none', maxAge: 1000 * 60 * 60 * 2})

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
            const {id_cardNumber, password, email} = req.body
            console.log('Datos de registro: ', id_cardNumber, password)

            const registerResult = await User.registerUserPOST({
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

    static async createUserPOST(req, res){
        try {
            const {id_cardNumber, first_name, last_name, email, phone_number} = req.body;
            console.log(req.body)
            const createUserResult = await User.createUser({
                name: first_name,
                last_name,
                email,
                id_cardNumber,
                phone_number
            })

            return {success: true, message: `Usuario ${first_name} ${last_name} con C.I ${id_cardNumber}`, result: createUserResult}
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
            console.log('Datos de logout: ', access_token)

            res.clearCookie(access_token);
            console.log(req.cookies)
            return res.status(200).json({
                message: 'Logout exitoso'
            })
        } catch (error) {
            console.log('Error en logoutPOST: ', error)
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