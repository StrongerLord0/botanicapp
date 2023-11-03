const express = require('express');
const mysql = require('mysql2');
const sharp = require('sharp');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

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
});

app.get('/getPlants/', (req, res) => {
    connection.query('SELECT ID,Nombre, ImageBase64 FROM Plantas', (error, results) => {
        if (error) {
            console.error('Error al obtener datos de las plantas:', error);
            res.status(500).send({ error: 'Error al obtener datos de las plantas' });
        } else {
            // Iterar sobre los resultados y redimensionar las imágenes
            Promise.all(results.map(async (plant) => {
                const imageBuffer = Buffer.from(plant.ImagenBase64, 'base64');
                const resizedImageBuffer = await sharp(imageBuffer).resize(128, 128).toBuffer();
                plant.ImagenBase64 = resizedImageBuffer.toString('base64');
                return plant;
            }))
            .then((updatedResults) => {
                res.send(updatedResults);
            })
            .catch((err) => {
                console.error('Error al redimensionar las imágenes:', err);
                res.status(500).send({ error: 'Error al redimensionar las imágenes' });
            });
        }
    });
});
app.get('/getPlant/:id', (req, res) => {
    const plantId = req.params.id;
    connection.query('SELECT * FROM Plantas WHERE ID = ?', [plantId], (error, results) => {
        if (error) {
            console.error('Error al obtener datos de la planta:', error);
            res.status(500).send({ error: 'Error al obtener datos de la planta' });
        } else {
            res.send(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});