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

app.post('/paises', (req, res) => {
    paises.push(req.body);
    fs.writeFileSync('./data/countries.json', JSON.stringify(paises));
    res.json(req.body);
});

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




