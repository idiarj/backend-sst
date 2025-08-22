import Pool from 'pg-pool'
const TRUNC = (s, n = 500) => (typeof s === 'string' && s.length > n ? s.slice(0, n) + '…' : s);
/**
 * @class Clase para manejar conexiones y realizar consultas a una base de datos SQL.
 */

export class PgHandler{

    /**
     * @constructor Crea una instancia de PgHandler.
     * @param {Object} config - Configuracion para el pool de conexiones de la clase.
     * @param {Object} querys - Objeto que contiene las consultas SQL predefinidas/
     */
    constructor({ config, querys }) {
        this.config = config
        this.querys = querys
        this.pool = new Pool(this.config)
    }

    /**
     * @method Metodo asincronico que devuelve una conexion a una base de datos SQL.
     * @returns {Promise<PoolCLient>} -Promesa que se resuelve devolviendo la conexion
     */
    async getConn(){
        try {
            return await this.pool.connect()
        } catch (error) {
            throw new Error(`No se ha podido obtener una conexion, ${error.message}`)
        }
    }

async execRawQuery({
  query,
  params = [],
  client = null,
  timeoutMs = 5000,         // statement_timeout por consulta
  logLabel = 'execRawQuery' // etiqueta para logs
}) {
  const isClientProvided = !!client;
  const start = Date.now();

  // Consigue cliente si no te lo pasaron
  client = isClientProvided ? client : await this.getConn();

  const shortQuery = TRUNC(query, 600);
  const shortParams = TRUNC(JSON.stringify(params), 800);

  // Opcional: stats del pool si los tienes disponibles
  const logPoolStats = async () => {
    try {
      if (this.pool) {
        console.log(`[${logLabel}] pool stats`, {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        });
      }
    } catch {}
  };

  try {
    console.log(`[${logLabel}] SQL -> ${shortQuery}`);
    console.log(`[${logLabel}] params -> ${shortParams}`);

    // Establece statement_timeout por consulta.
    // Nota: SET LOCAL requiere transacción. Si no estás en transacción, usa SET y luego resetea.
    await client.query(`SET statement_timeout = '${timeoutMs}ms'`);

    const result = await client.query(query, params);

    const ms = Date.now() - start;
    console.log(`[${logLabel}] rowCount=${result.rowCount} in ${ms}ms`);

    // IMPORTANTE: no loguees result completo (puede ser enorme)
    return result.rows;
  } catch (error) {
    // Si la consulta tardó mucho, imprime stats del pool para diagnosticar
    const ms = Date.now() - start;
    if (ms > timeoutMs) {
      console.warn(`[${logLabel}] exceeded timeout (${ms}ms > ${timeoutMs}ms)`);
      await logPoolStats();
    }
    console.error(`[${logLabel}] ERROR: ${error.message}`);
    throw new Error(`Error al ejecutar la consulta: ${error.message}`);
  } finally {
    try {
      // Restablece el timeout para que no quede pegado al cliente del pool
      await client.query(`SET statement_timeout = DEFAULT`);
    } catch {}
    if (!isClientProvided) {
      try {
        await this.releaseConn(client);
      } catch (e) {
        console.error(`[${logLabel}] WARN releaseConn: ${e?.message || e}`);
      }
    }
  }
}

    /**
     * @method - Metodo asincrona para ejecutar una consulta SQL a una base de datos.
     * @param {Object} options - Objeto con las opciones para la ejecucion de la consulta
     * @param {string} options.key - La clave que referencia la consulta SQL predefinidas en el objeto querys
     * @param {Array} [options.params=[]] - Parametros con los que se ejecutaran la consulta. 
     * @param {PoolClient} [options.client=null] - Cliente opcional para ejecutar la consulta. Si no se proporciona, se obtiene uno nuevo.
     * @returns {Promise<Array>} - Promesa que resuelve con el resultado de la consulta SQL.
     * @throws {Error} - Lanza un error si la consulta no se puede ejecutar correctamente.
     */
    async exeQuery({key, params = [], client = null}){
        const isClientProvided = client ? true : false
        client = isClientProvided ? client : await this.getConn()
        //console.log('estoy en una transaccion?', isClientProvided)
        
        // console.log(client)
        try {
            //console.log(`la key es ${key}`)
            const query = this.querys[key]
            if (!query) {
                console.log(`NO HAY QUERY`)
                throw new Error(`Query not found for key: ${key}`);
            }
            console.log(`la query entera es ${query}`)
            console.log(`los parametros son ${params}`)
            
            const result = await client.query(query, params)
            // console.log(result)
            // console.log(result.rows)
            return result.rows

        } catch (error) {

            console.log(error)
            throw new Error(`Error al ejecutar la consulta ${key}, ${error.message}`)

        }finally{
            if(!isClientProvided){
                await this.releaseConn(client)
            }
        }
    }
    

    /**
     * @method Metodo asincrona para liberar una conexion a una base de datos SQL.
     * @param {PoolClient} client - Conexion que se liberara.
     * 
     */
    async releaseConn(client){
        try {
            await client.release()
        } catch (error) {
            console.log(error.message)
            throw new Error(`No se ha podido liberar la conexion, ${error.message}`)
        }
    }

    /**
     * @method Metodo para inicializar una transaccion.
     * @returns {PoolClient}  - Cliente con el que se realizaran las demas operacion de la transaccion.
     * @throws {Error} Lanza un error si no se puede obtener una conexión o si ocurre un error 
     *                  al intentar comenzar la transacción.
     */
    async beginTransaction(){
        const client = await this.getConn()
        try {
            await client.query('BEGIN')
            return client
        } catch (error) {
            throw new Error(`No se ha podido inicializar la transaccion, ${error.message}`)
        }
    }

    /**
     * @method Metodo para realizar una transaccion.
     * @param {PoolClient} client - Cliente con el que se realizaran las demas operacion de la transaccion.
     * @throws {Error} Lanza un error si no se puede obtener una conexión o si ocurre un error 
     *                  al intentar realizar la transacción.
     */

    async commitTransaction(client){
        //if(client) throw new Error('No se ha proporcionado un cliente o se proporciono uno invalio.')
        try{
            await client.query('COMMIT')
            await this.releaseConn(client)
        }catch{     
            throw new Error(`No se ha podido realizar la transaccion, ${error.message}`)
        }
    }

    /**
     * @method Metodo para deshacer una transaccion si ocurre un error durante su ejecucion.
     * @param {PoolClient} client - Cliente con el que se realizaran las demas operacion de la transaccion.
     * @throws {Error} Lanza un error si no se puede obtener una conexión o si ocurre un error 
     *                  al intentar deshacer la transacción.
     */
    async rollbackTransaction(client){
        try {
            await client.query('ROLLBACK')
            await this.releaseConn(client)
        } catch (error) {
            throw new Error(`No se ha podido deshacer la transaccion, ${error.message}`)
        }
    }

}