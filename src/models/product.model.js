import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: true
        },
        price: {
            type: Number,
            required: true
        },
        stock: {
            type: Number,
            required: true
        },
        descripcion: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            required: true,
            default: true
        },
        image_base_64: {
            type: String
        },
        seller_id: {
            type: mongoose.Schema.Types.ObjectId, //Debe ser el mismo tipo que el id de la coleccion de User
            ref: 'User',
            required: true
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        }
    }
)

const Product = mongoose.model('Products', productSchema)
export default Product