const { Pool, QueryConfig, PoolConfig, PoolClient } = require("pg");



const poolConfig = {
    connectionString: process.env.DATABASE_URL
}
  
if (process.env.DATABASE_SSL != undefined)
    poolConfig.ssl = JSON.parse(process.env.DATABASE_SSL);

console.log(process.env.DATABASE_URL);
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
  
exports.query = async ( query, ...params) => {
    console.log("Querying: " + query);
    let result;
    result = await pool.query(query, params);
    console.log("done" );

    return result.rows
}
  
exports.close = () => {
    return pool.end()
}