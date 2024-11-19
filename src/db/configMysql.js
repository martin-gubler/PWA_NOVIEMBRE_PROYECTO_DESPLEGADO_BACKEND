//mysql esta version se manejaba con callbacks

//libreria vieja arriba, libreria nueva abajo

//mysql2 /promises


//metodo viejo con callbacks
/* 
db.queri('SELECT consulta x', (err, result) => {
    result.send({ok: true})
}) 
*/


//metodo nuevo con async await
/* const result = await db.query() */

import mysql from 'mysql2/promise'
import ENVIROMENT from '../config/enviroment.config.js'

const database_pool = mysql.createPool({
    host: ENVIROMENT.MYSQL.HOST ,
    user: ENVIROMENT.MYSQL.USERNAME,
    password: ENVIROMENT.MYSQL.PASSWORD, 
    database: ENVIROMENT.MYSQL.DATABASE,
    connectionLimit: 10
})

const checkConnection = async () => {
    try{
        const connection = await database_pool.getConnection()//Devolver la conexion
        await connection.query('SELECT 1') //Consulta simple de excusa para verificar la conexion
        //cuando la consulta falle dara un throw
        console.log('conexion exitosa con MYSQL')
        connection.release() //Matar la conexion de la pool
    }
    catch(error){
        console.error('Error al conectar con la base de datos')
    }
}

checkConnection() //Nos confirmara via consola que todo esta bien
export default database_pool