const express = require('express');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;

app.use(express.json());

// Función auxiliar para leer el archivo data.json
async function readData() {
    const data = await fs.readFile('./data/countries.json', 'utf8');
    return JSON.parse(data);
}

// Función auxiliar para escribir en el archivo data.json
async function writeData(data) {
    await fs.writeFile('./data/countries.json', JSON.stringify(data, null, 2));
}

// Función auxiliar para filtrar países por idioma
function filtrarPaisesPorIdioma(paises, idiomaBuscado) {
    return paises.filter(pais => 
        pais.idioma.some(idioma => 
            idioma.toLowerCase() === idiomaBuscado.toLowerCase()
        )
    );
}

// GET /paises - Obtener todos los países
app.get('/paises', async (req, res) => {
    try {
        const { idioma } = req.query;
        const data = await readData();
        
        if (idioma) {
            const paisesFiltrados = filtrarPaisesPorIdioma(data, idioma);
            
            if (paisesFiltrados.length === 0) {
                return res.status(404).json({ 
                    mensaje: `No se encontraron países que hablen ${idioma}`
                });
            }
            
            return res.json(paisesFiltrados);
        }
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos' });
    }
});

// GET /paises/idioma/:idioma - Obtener países por idioma
app.get('/paises/idioma/:idioma', async (req, res) => {
    try {
        const data = await readData();
        const paisesFiltrados = filtrarPaisesPorIdioma(data, req.params.idioma);
        
        if (paisesFiltrados.length === 0) {
            return res.status(404).json({ 
                mensaje: `No se encontraron países que hablen ${req.params.idioma}`
            });
        }
        
        res.json(paisesFiltrados);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos' });
    }
});

// GET /paises/:nombre - Obtener un país específico
app.get('/paises/:nombre', async (req, res) => {
    try {
        const data = await readData();
        const pais = data.find(p => 
            p.pais.toLowerCase() === req.params.nombre.toLowerCase()
        );
        
        if (!pais) {
            return res.status(404).json({ error: 'País no encontrado' });
        }
        
        res.json(pais);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos' });
    }
});

// POST /paises - Crear un nuevo país
app.post('/paises', async (req, res) => {
    try {
        const data = await readData();
        const nuevoPais = req.body;
        
        // Validación básica
        if (!nuevoPais.pais || !nuevoPais.idioma || !nuevoPais.continente) {
            return res.status(400).json({ 
                error: 'Faltan datos requeridos (pais, idioma, continente)' 
            });
        }
        
        // Verificar si el país ya existe
        const paisExistente = data.find(p => 
            p.pais.toLowerCase() === nuevoPais.pais.toLowerCase()
        );
        
        if (paisExistente) {
            return res.status(400).json({ error: 'El país ya existe' });
        }
        
        data.push(nuevoPais);
        await writeData(data);
        
        res.status(201).json(nuevoPais);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar los datos' });
    }
});

// DELETE /paises/:nombre - Eliminar un país
app.delete('/paises/:nombre', async (req, res) => {
    try {
        const data = await readData();
        const paisIndex = data.findIndex(p => 
            p.pais.toLowerCase() === req.params.nombre.toLowerCase()
        );
        
        if (paisIndex === -1) {
            return res.status(404).json({ error: 'País no encontrado' });
        }
        
        data.splice(paisIndex, 1);
        await writeData(data);
        
        res.json({ mensaje: 'País eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar los datos' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});