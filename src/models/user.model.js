//aqui tendremos el modelo del usuario

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        require: true
    },
    role: {
        type: String,
        require: true,
        default: 'user'
    }
})

const User = mongoose.model('User', userSchema)

export default User
