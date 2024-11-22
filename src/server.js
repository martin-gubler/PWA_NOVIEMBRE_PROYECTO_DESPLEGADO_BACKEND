import ENVIROMENT from './config/enviroment.config.js';
import express from 'express'
import statusRouter from './router/status.router.js';
//Lo dejamos porque es la conexion a la DB
import mongoose from './db/config.js';
import authRouter from './router/auth.router.js';
import cors from 'cors'
import productRouter from './router/products.router.js';
import { verifyApiKeyMiddleware } from './middlewares/auth.middleware.js';
import database_pool from './db/configMysql.js';
import ProductRepository from './repositories/product.repository.js';


const app = express();
const PORT = ENVIROMENT.PORT || 3000


app.use(cors());
app.use(express.json({limit: '5mb'}))
app.use(verifyApiKeyMiddleware)


app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)

ProductRepository.getProducts()

app.listen(PORT, () => {
    console.log(`el servidor se esta ejecutando en el http://localhost:${PORT}`)
})
