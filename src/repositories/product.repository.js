import database_pool from "../db/configMysql.js";
import Product from "../models/product.model.js";

/* class ProductRepository{
    static async getProducts(){
        //Obtener lista de productos activos
        return Product.find({active: true})
    }

    static async getProductById(id){
        return Product.findById(id)
    }

    static async createProduct(product_data){
        const new_product = new Product(product_data)
        return new_product.save()
    }

    static async updateProduct(id, new_prouct_data){
        return Product.findByIdAndUpdate(id, new_prouct_data, {new: true})
    }

    static async deleteProduct(id){
        return Product.findByIdAndUpdate(id, {active: false}, {new: true})
    }
} */

class ProductRepository {
    static async getProducts(){
        //SELECT * FROM products WHERE active = true
        //traduccion, seleccionar todos los productos donde active sea true
        const query = 'SELECT * FROM Products WHERE active = true'
        const [registros, columnas] = await database_pool.execute(query)
         //Esto devuelve un array con 2 valores, 
        //el primer valor es el resultado o las rows / filas / registros
        // el segundo valor son las columns (id, price, title, stock, etc)
        return registros
    }

    //Si queremos devolver null cuando no se encuentre
    static async getProductById(product_id){
        const query = 'SELECT * FROM Products WHERE id = ?'
        //Execute espera como segundo parametro un array con los valores que quieras reemplazar en la query
        const [registros] = await database_pool.execute(query, [product_id])
        return registros.length > 0 ? registros[0] : null
    }
    static async createProduct(product_data){
        const {title, price, stock, descripcion, seller_id, image_base_64} = product_data
        console.log('Datos enviados al backend:', product_data);
        const query = `INSERT INTO Products 
        (title, price, stock, descripcion, seller_id, image_base_64, active) 
        VALUES 
        ( ?, ?, ?, ?, ?, ?, true)
        `
        const [resultado] = await database_pool.execute(query, [
            title, price, stock, descripcion, seller_id, image_base_64
        ])
        return {
            id: resultado.insertId,
            title, 
            price, 
            stock, 
            descripcion, 
            seller_id, 
            image_base_64,
            active: true
        }
    }
}

export default ProductRepository