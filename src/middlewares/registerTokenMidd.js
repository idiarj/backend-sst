import jwtComponent from "../services/jwtComponent.js";
import dotenv from 'dotenv';
//dotenv.config();

export const registerTokenMiddleware = (req, res, next) => {
    try {
        const { register_token } = req.cookies;

        console.log(req.cookies)
        if (!register_token) {
            return res.status(401).json({ error: 'No autorizado. Verifique su cédula primero.' });
        }
        const decoded = jwtComponent.verifyToken({
            token: register_token,
            key: process.env.REGISTER_TOKEN_SECRET
        })
        req.id_cardNumber = decoded.id_cardNumber; // Opcional: pasar info al siguiente handler
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token de registro inválido o expirado.' });
    }
}

export default registerTokenMiddleware;