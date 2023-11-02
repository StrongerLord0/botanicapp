const fastify = require('fastify')();
const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config(); 

const database = process.env.DATABASE;
const username = process.env.DBUSERNAME;
const host = process.env.DBHOST;
const password = process.env.DBPASSWORD;

const connection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
    database: database,
    port: 3306,
    ssl: {
        ca: fs.readFileSync('./cacert-2023-08-22.pem'),
    }
  });

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conexión a la base de datos establecida');
})

fastify.get('/getPlants', (request, reply) => {
    connection.query('SELECT * FROM Plantas', (error, results) => {
        if (error) {
          console.error('Error al obtener datos de las plantas:', error);
          reply.code(500).send({ error: 'Error al obtener datos de las plantas' });
        } else {
          // Envía los datos de las plantas como respuesta
          reply.send(results);
        }
    });
});

// Arranca el servidor en el puerto 3000
fastify.listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor escuchando en ${address}`);
});