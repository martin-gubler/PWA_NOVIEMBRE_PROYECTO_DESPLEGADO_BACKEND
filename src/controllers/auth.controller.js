import ResponseBuilder from "../utils/builders/response.Builder.js"
import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import jwt, { decode } from 'jsonwebtoken'
import ENVIROMENT from "../config/enviroment.config.js"
import { sendEmail } from "../utils/builders/mail.util.js"
import UserRepository from "../repositories/user.repository.js"
import { response } from "express"



export const registerUserController = async (req, res) => {   
    try{
        const {name, email, password} = req.body
        /* Hacer validacion */
        if(!email){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload(
                {
                    detail: 'El email no es valido'
                }
            )
            .build()
            return res.status(400).json(response)
        }
        const existentUser = await User.findOne({email: email})
        console.log({existentUser})
        if(existentUser){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Bad request')
            .setPayload(
                {
                    detail: 'El email ya esta en uso'
                }
            )
            .build()
            return res.status(400).json(response)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = jwt.sign({email: email}, ENVIROMENT.JWT_SECRET, {
            expiresIn: '1d'
        })
        const url_verification =`http://localhost:${ENVIROMENT.PORT}/api/auth/verify/${verificationToken}`
        await sendEmail({
            to: email,
            subject: 'verificacion de mail con token',
            html: `
            <h1>Verificacion</h1>
            <p>Da click en el boton de abajo para verificar</p>
            <a 
                tyle='background-color: 'black';
                color: 'white'; 
                padding: 5px; 
                border-radius: 5px;
                href="${url_verification}"
            >Click aqui para verificar</a>
            `
        })

        const newUser = new User ({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            emailVerified: false
        })

        //Metodo save nos permite guardar el objeto en la DB
        await newUser.save()
    
        const respose = new ResponseBuilder()
        .setOk(true) 
        .setStatus(200)
        .setMessage('created')
        .setPayload({})
        .build()
        return res.status(201).json(respose)
    }
    catch(error){
        console.error('Error al registrar usuario', error)
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('internal server error')
        .setPayload(
            {
                detail: error.message
            }
        )
        .build()
        return res.status(500).json(response)
    }
}

/* const resultado = bcrypt.compareSync('pepe123', '$2b$10$eqIrtCNHkNalwJZmyRKni.NKX6anCH9f6Mg3I79z2xPgKY9hpddjm')
console.log({resultado}) */


const verifyMailValidationTokenController = async (req, res) => {
    try{    
        const {verification_token} = req.params
        if(!verification_token){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setPayload({
                detail: 'Falta enviar token'
            })
            .build()
            return res.status(400).json(response);
        }
        /* Verificamos la firma el token, debe ser la misma que mi clave secreta, 
        eso asegura que este token sea emitido por mi servidor */
        //Si fallara la lectura/verificacion/expiracion  hara un throw
        const decoded = jwt.verify(verification_token, ENVIROMENT.JWT_SECRET)
        const user = await User.findOne({email: decoded.email})
        if(!user){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setPayload({
                detail: 'Usuario no encontrado'
            })
            .build();
        return res.status(404).json(response);
        }
        if(user.emailVerified){
            const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('El correo ya ha sido verificado previamente.')
            .build();
        return res.status(200).json(response);
        }
        //En caso de pasar las validaciones
        user.emailVerified = true
       /*  user.verificationToken = undefined */

        await user.save()
        const response = new ResponseBuilder()
        .setOk(true)
        .setMessage('Email verificaddo con exito')
        .setStatus(200)
        .setPayload({
            message: 'Usuario validado'
        })
        .build()
        return res.status(200).json(response);
    }
    catch(error){
        console.log(error);
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Error interno del servidor')
            .setPayload({
                detail: error.message
            })
            .build();
        return res.status(500).json(response)
    }
}

export const loginController = async (req, res) => {
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user) {
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Usuario no encontrado')
            .setPayload({
                detail:'El email no esta registrado'
            })
            .build()
            return res.json(response)
        }
        if(!user.emailVerified){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(403)//Contendi  prohibiddo para usuarios que no tengan su email verificao
            .setMessage('El email no verificado')
            .setPayload({
                detail:'Porfavor, verifica tu correo electronico antes de iniciar sesion'
            })
            .build()
            return res.json(response)
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(401)
            .setMessage('Credenciales incorrectas')
            .setPayload({
                detail:'Contrasena incorrecta'
            })
            .build()
            return res.json(response)
        }
        const token = jwt.sign({
            email: user.email, 
            id: user._id, 
            role: user.role
        }, ENVIROMENT.JWT_SECRET, {expiresIn: '1d'})
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('logueado')
        .setPayload({
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        .build()
        return res.json(response)
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(200)
        .setMessage('Internal server error')
        .setPayload({
            detail: error.message
        })
        .build()
        return res.json(response)
    } 
}

export const forgotPasswordController = async (req, res) => {
    try {
        const {email} = req.body
        //Validamos que llegue el email
        const user = await UserRepository.obtenerPorEmail(email)
        if(!user){
            //Logica de usuario no encontrado
        }
        const resetToken = jwt.sign({email: user.email}, ENVIROMENT.JWT_SECRET, {
            expiresIn: '1h'
        })
        const resetUrl = `${ENVIROMENT.URL_FRONT}/reset-password/${resetToken}`
        sendEmail({
            to: user.email,
            subject: 'Restablecer contrasena',
            html: `
                <div>
                    <h1>Has solicitado restablecer tu contrasena</h1>
                    <p>Has click en el enlace de abajo para restablecer tu contrasena</p>
                    <a href='${resetUrl}'>Restablecer</a>
                </div>
            `
        })
        const response = new ResponseBuilder()
        response.setOk(true)
        response.setStatus(200)
        response.setMessage('Se envio el correo')
        response.setPayload({
            detail:'Se envio un correo electronico con las instrucciones para restablecer la contrasena'
        }
    )
        .build()
        return res.json(response)
    } 
    catch(error){
        //Mnaejar logica de error
    }
}

//Podrias agregar mas valiaciones amargo
export const resetTokenController = async (req, res) => {
    try{
    const {password} = req.body
    const {reset_token} = req.params
    if(!password){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(400)
        .setPayload({
            detail: 'Se necesita una nueva contrasena'
        })
        .build()
        return res.status(400).json(response);
    }
    if(!reset_token){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setPayload({
                detail: 'Falta enviar token'
            })
            .build()
            return res.status(400).json(response);
        }
    
    const decoded = jwt.verify(reset_token, ENVIROMENT.JWT_SECRET)
    console.log('Token decodificado de ejemplo:', decoded)
    
    if(!decoded){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(400)
        .setPayload({
            detail: 'Falta token de verificacion'
        })
        .build()
        return res.status(400).json(response);
    }

    const { email } = decoded

    const user = await UserRepository.obtenerPorEmail(email)
    // 2 formas diferentes de hacer lo mismo arriba y abajo
    /* const user = await User.findOne({email: decoded.email}) */
        
    if(!user){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setPayload({
                detail: 'Usuario no encontrado'
            })
            .build();
            return res.status(404).json(response);
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword; 
        await user.save()

            const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Contrasena cambiada con exito')
            .setPayload({
                detail: 'Contraseña actualizada exitosamente'
            })
            .build();
            return res.status(200).json(response);
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setPayload({
            detail: 'Error interno del servidor',
            error: error.message
        })
        .build();
        return res.status(500).json(response);
    }
}


export {verifyMailValidationTokenController}

/* 
resetTokenController

Obtener del body la password
Decodificar/verify el reset_token
Buscar al usuario con el email recibido en el rest_token
Encriptar la password
Guarda la nueva contrasena en el campo password del usuario
como es un put el metodo debe ser un PUt
*/