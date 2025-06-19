

import User from "../models/userModels.js"
import sessionManager  from "../services/sessionManager.js"
import dotenv from 'dotenv';
dotenv.config();

class AuthController{
    static async loginPOST(req, res){
        try {;
            const {username, password} = req.body
            console.log('Datos de login: ', username, password)


            //Validar nombre de usuario
            const isValidUser = await User.validateUsername({username})
            if(!isValidUser){
                return res.status(404).json({
                    error: 'Nombre de usuario no encontrado'
                })
            }
            //Validar contraseña
            const isValidPassword = await User.validatePassword({usuario: username, password})
            if(!isValidPassword){
                return res.status(401).json({
                    error: 'Contraseña incorrecta'
                })
            }

            // Crear sesion con jsonwebtoken

            const access_token = sessionManager.createSession({})





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
            const {username, pwd, email} = req.body
            console.log('Datos de registro: ', username, pwd, email)

            await User.createUser({
                username,
                pwd,
                email
            })
            return res.status(200).json({
                mensaje: `Registro de ${username} exitoso`
            })
        } catch (error) {
            console.log('Error en registerPOST: ', error)
            return res.status(500).json({
                error: 'Error al intentar registrarse, por favor intentelo mas tarde',
                detalle: error.message
            })
        }
    }

    static async logout(req, res){
        try {
            
        } catch (error) {
            console.log('Error en logoutPOST: ', error)
            return res.status(500).json({
                error: 'Error al intentar hacer logout',
                detalle: error.messagge
            })
        }
    }
}


export default AuthController;