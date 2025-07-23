import { Router } from "express";
import userController from "../controllers/userController.js";



export const userRouter = Router();

userRouter.post('/createUser', userController.createUserPOST);