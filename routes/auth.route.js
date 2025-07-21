import Router from 'express'
import AuthController from '../controllers/authController.js';
import registerTokenMiddleware from '../middlewares/registerTokenMidd.js';

export const authRouter = Router();

authRouter.post('/register', registerTokenMiddleware, AuthController.registerPOST)
authRouter.post('/login', AuthController.loginPOST)
authRouter.post('/logout', AuthController.logout)
authRouter.post('/verifyIdCard', AuthController.verifyIdCardNumberPOST)
authRouter.post('/forgot-password', AuthController.forgotPassword)
authRouter.post('/reset-password', AuthController.changePassword)