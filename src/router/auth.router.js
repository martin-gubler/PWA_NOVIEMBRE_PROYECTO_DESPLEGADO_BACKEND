import express from 'express'
import { forgotPasswordController, 
    loginController, 
    registerUserController, 
    resetTokenController, 
    verifyMailValidationTokenController 
} from '../controllers/auth.controller.js'
import { verifyApiKeyMiddleware } from '../middlewares/auth.middleware.js'

const authRouter = express.Router()

authRouter.post('/register',  registerUserController)
authRouter.get('/verify/:verification_token', verifyMailValidationTokenController)
authRouter.post('/login', loginController)
authRouter.post('/forgot-password', forgotPasswordController)
authRouter.put('/reset-password/:reset_token', resetTokenController) 


/* 
resetTokenController

Obtener del body la password
Decodificar/verify el reset_token
Buscar al usuario con el email revibido en el rest_token
Encriptar la password
Guarda la nueva contrasena en el campo password del usuario
como es un put el metodo debe ser un PUt
*/
export default authRouter