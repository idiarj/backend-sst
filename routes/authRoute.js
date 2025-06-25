import Router from 'express'
import AuthController from '../controllers/authController.js';
import registerTokenMiddleware from '../middlewares/registerToken.js';

export const authRouter = Router();

authRouter.post('/register',registerTokenMiddleware,AuthController.registerPOST)
authRouter.post('/login', AuthController.loginPOST)
authRouter.post('/logout', AuthController.logout)
authRouter.post('/createUser', AuthController.createUserPOST)
authRouter.post('/verifyIdCard', AuthController.verifyIdCardNumberPOST)