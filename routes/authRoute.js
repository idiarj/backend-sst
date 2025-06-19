import Router from 'express'
import AuthController from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.registerPOST)
authRouter.post('/login', AuthController.loginPOST)
authRouter.post('/logout', AuthController.logout)