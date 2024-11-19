import mongoose from "mongoose";
import ENVIROMENT from "../config/enviroment.config.js";

console.log(ENVIROMENT.DB_URL)

mongoose.connect(ENVIROMENT.DB_URL)
.then(
    () => {
        console.log('conexion exitosa con MONGO_DB')
    }
)
.catch()
{
    (error) => {
        console.log('Error de coexion con la db mongo')
    }
}

export default mongoose