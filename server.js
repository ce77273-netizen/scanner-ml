const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Token de Mercado Libre (el que funciona en Postman)
const TOKEN = "APP_USR-3794188853864564-031808-54e8914a3779c6ea6b76b486d2f76f09-2288203181";
const VENDEDOR_ID = 2288203181; // ID de ROTOCRISTALES

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para consultar envíos (proxy)
app.get('/api/shipment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📦 Consultando envío: ${id}`);
        
        const response = await axios.get(`https://api.mercadolibre.com/shipments/${id}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'x-format-new': 'true'
            }
        });

        // Verificar que sea un envío de ROTOCRISTALES
        if (response.data.origin?.sender_id !== VENDEDOR_ID) {
            return res.status(403).json({ 
                error: 'Este envío no pertenece a ROTOCRISTALES' 
            });
        }

        console.log('✅ Envío encontrado');
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Envío no encontrado' });
        }
        
        if (error.response?.status === 403) {
            return res.status(403).json({ error: 'Sin permisos para ver este envío' });
        }
        
        res.status(500).json({ 
            error: 'Error al consultar el envío',
            details: error.message 
        });
    }
});

// Endpoint para verificar que el backend funciona
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        vendedor: 'ROTOCRISTALES',
        id: VENDEDOR_ID,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`👤 Vendedor: ROTOCRISTALES (ID: ${VENDEDOR_ID})`);
});