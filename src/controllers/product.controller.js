import mongoose from "mongoose"
import ProductRepository from "../repositories/product.repository.js"
import ResponseBuilder from "../utils/builders/response.Builder.js"

//Crear el esquema en mongo db
//Desarrollar cada controlador

//que recibo
//nada

//que respondo en caso de que este todo bien
// lista dde prouctos activos [Productos]

/* 
Firma con el frontend, me comprometo a crear este endpoint

ENDPOINT: api/products
Method: GET

headers:
    - x-api-key
    - Authorization
    
response: {
    ok: true,
    status: 200,
    message: productos obtenidos,
    payload: {
        products: [
            {
            title,
            price,
            stock,
            description,
            category,
            _idd,
            active,
            creado_en
            }
        ]
    }
}*/

export const getAllProductsController = async (req, res) => {
    try {
        const products_from_db = await ProductRepository.getProducts()
        
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Productos obtenidos')
        .setPayload({
            products: products_from_db
        })
        .build()
        return res.json(response)
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal server error')
        .setPayload({
            detail: error.message
        })
        .build()
        return res.status(500).json(response)
    }
}

export const getProductByIdController = async (req, res) => {
    try {
        const {product_id} = req.params
        const product_found = await ProductRepository.getProductById(product_id)
        if(!product_found){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Product not found')
            .setPayload({
                detail:`El producto con id ${product_id} no existe`
            })
            .build()
            return res.status(404).json(response)
        }
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Producto obtenido')
        .setPayload({
            products: product_found
        })
        .build()
        return res.json(response)
    }
    catch(error){ 
        console.error(error.setMessage)
        //hacer validacion si no esta tire error, se queda cargando porque no tenemos productos
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal Server Error')
        .setPayload({
            detail: error.message
        })
        .build()
    return res.status(500).json(response)
    }
    
}

export const createProductController = async (req, res) => {
    try{
        const {title, price, stock, descripcion, category, image} = req.body
        //Esto es clave el seller_id NO debe venir nunca el body, debe venir en el req.user,
        // (que a su vez viene del token de login con los datos de la sesion del usuario)
        const seller_id = req.user.id
        
        if(!title){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Titulo invalido')
            .setPayload({
                detail: 'titulo invalido o vacio'
            })
            .build()
            return res.status(400).json(response)
        }
        if(!price || price < 1){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Precio invalido')
            .setPayload({
                detail: 'precio invalido o vacio'
            })
            .build()
            return res.status(400).json(response)
        }
        if(!stock || stock <= 0 || isNaN(stock)){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('stock invalido')
            .setPayload({
                detail: 'Stock invalido o vacio'
            })
            .build()
            return res.status(400).json(response)
        }
        if(!descripcion){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('descripcion invalida')
            .setPayload({
                detail: 'descripcion invalida o vacia'
            })
            .build()
            return res.status(400).json(response)
        }
        if(!category){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('categoria invalida')
            .setPayload({
                detail: 'categoria invalida o vacia'
            })
            .build()
            return res.status(400).json(response)
        }
        if(image && Buffer.byteLength(image, 'base64') > 2 * 1024 * 1024){
            console.error('Imagen muy grande')
            return res.sendStatus(400)
        }

        const new_product = {
            title, 
            price, 
            stock, 
            descripcion, 
            category,
            image_base_64: image,
            seller_id
        }
        
        const createdProduct = await ProductRepository.createProduct(new_product)
        if(!createdProduct){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('el producto no pudo ser creado')
            .setPayload({
                detail: 'error en la creacion del producto'
            })
            .build()
            return res.status(400).json(response)
        }
        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Producto Creado')
            .setPayload(
                {
                    data: {
                        title: createdProduct.title,
                        price: createdProduct.price,
                        stock: createdProduct.stock,
                        descripcion: createdProduct.descripcion,
                        category: createdProduct.category,
                        id: createdProduct.id
                    }
                    
                }
            )
            .build()
        return res.json(response)
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal Server Error')
        .setPayload({
            detail: error.message
        })
        .build()
    return res.status(500).json(response)
    }
}

export const updateProductController = async (req, res) => {
    try {
        const { product_id } = req.params
        const { title, price, stock, descripcion, category } = req.body
        const seller_id = req.user.id
        if (!title) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de titulo')
                .setPayload({
                    detail: 'Titulo invalido o campo esta vacio'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!price && price < 1) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de precio')
                .setPayload({
                    detail: 'Precio invalido o campo vacio, solo valor numerico permitido mayor a 0'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!stock && isNaN(stock)) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de stock')
                .setPayload({
                    detail: 'stock invalido o campo vacio, solo valor numerico permitido'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!descripcion) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de descripcion')
                .setPayload({
                    detail: 'campo vacio, debe ingresar una descripcion'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!category) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de categoria')
                .setPayload({
                    detail: 'cateogria invalida o campo vacio'
                })
                .build()
            return res.status(400).json(response)
        }

        const product_found = await ProductRepository.getProductById(product_id)
        const newProduct = {
            title,
            price,
            stock,
            descripcion,
            category
        }

        if(seller_id !== product_found.seller_id){
            //Error de status 403
            return res.sendStatus(403)
        }
        const productoActualizado = await ProductRepository.updateProduct(product_id, newProduct)
        if (!productoActualizado) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('Error al actualizar producto')
                .setPayload({
                    detail: 'Producto no encontrado'
                })
                .build()
            return res.status(404).json(response)
        }
        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Producto actualizado con exito!')
            .setPayload(
                {
                    data: {
                        title: newProduct.title,
                        price: newProduct.price,
                        stock: newProduct.stock,
                        descripcion: newProduct.descripcion,
                        category: newProduct.category
                    }
                }
            )
            .build()
        res.json(response)
    }
    catch (error) {
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Internal Server Error')
            .setPayload({
                detail: error.message
            })
            .build()
        res.status(500).json(response)
    }
}

export const deleteProductController = async (req, res) => {
    try {
        const { product_id } = req.params
        const product_found  = await ProductRepository.getProductById(product_id)

        if(!product_found){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Producto no encontrado')
            .setPayload({
                detail: 'el producto no existe'
            })
            .build()
            return res.status(404).json(response)
        }
        
        //Si no sos el admin y tampoco sos el dueno entonces no podes estar aca
        if(req.user.rol !== 'admin' && req.user.id !== product_found.seller_id.toString()){
            return res.status(403)
        }
        const eliminarProducto = await ProductRepository.deleteProduct(product_id)
        if(!eliminarProducto){
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Producto no encontrado')
            .setPayload({
                detail: 'el id no existe'
            })
            .build()
            return res.status(404).json(response)
        }
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Producto eliminado con exito')
        .setPayload(
            {
                data: `el producto con id:${product_id} fue eliminado con exito`
            }
        )
        .build()
        return res.json(response)
    } 
    catch (error) {
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal Server Error')
        .setPayload({
            detail: error.message
        })
        .build()
    res.status(500).json(response)
    }


}

