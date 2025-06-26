import jwtComponent from "../services/jwtComponent.js";
import dotenv from 'dotenv';
dotenv.config()

export const authMiddleware = (req, res, next) =>{
    try {
        const { access_token } = req.cookies;
        if(!access_token){
            return res.status(401).json({
                error: 'No autorizado. Por favor inicie sesion primero.'
            })
        }

        const decoded = jwtComponent.verifyToken({
            token: access_token,
            key: process.env.ACCESS_TOKEN_SECRET

        })

        req.session = decoded;

        consolelog(req.session)
        next();
        
    } catch (error) {
        next(error)
    }
}