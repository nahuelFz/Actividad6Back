const express = require('express');
const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());

// Leer el archivo JSON con los datos de los países
const fs = require('fs');
let paises = JSON.parse(fs.readFileSync('./data/countries.json'));

// Rutas
app.get('/paises', (req, res) => {
    res.json(paises);
});

app.get('/paises/:nombre', (req, res) => {
    const pais = paises.find(p => p.pais === req.params.nombre);
    res.json(pais || {});
});


app.get('/paises', (req, res) => {
    const idioma = req.query.idioma.toLowerCase(); // Convertir el idioma a minúsculas
    const paisesPorIdioma = paises.filter(p => p.idioma.some(idiomaPais => idiomaPais.toLowerCase() === idioma));
    res.json(paisesPorIdioma);
});

app.get('/paises/idioma/:idioma', async (req, res) => {
    const { idioma } = req.params
    const countries = await req.movies.find({ idioma: {$in: [idioma]} }).toArray()
    res.json(countries)
})

app.post('/paises/', async (req,res) => {
    const nuevoPais = req.body
    if (nuevoPais === undefined)
        res.status(400).send('Error en el formato del pais')
    try {
        await req.countries.insertOne(nuevoPais)
        res.status(201).send(nuevoPais)
    } catch (error) {
        es.status(500).send('Error al agregar pais')
    }
})


app.delete('/paises/:nombre', (req, res) => {
    const index = paises.findIndex(p => p.pais === req.params.nombre);
    if (index !== -1) {
        paises.splice(index, 1);
        fs.writeFileSync('./data/countries.json', JSON.stringify(paises));
    }
    res.sendStatus(204);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${port}`);
});




