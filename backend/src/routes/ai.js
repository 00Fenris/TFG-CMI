const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy'
});

router.post('/insights', requireAuth, async (req, res) => {
    try {
        const { kpis, scope } = req.body;

        // Si no hay kpis no podemos analizar nada
        if (!kpis || kpis.length === 0) {
            return res.json({
                deteccion: 'No hay suficientes datos registrados para la inferencia.',
                recomendacion: 'Se requiere recolectar más entradas de KPIs.'
            });
        }

        // Comprimimos el payload para no gastar miles de tokens:
        // Solo mandamos Nombre, Restaurante, Valor Actual y Objetivo
        const contextStr = kpis.map(k =>
            `- ${k.kpi.name} (${k.restaurant?.name || 'Global'}): ${parseFloat(k.kpi.current_value).toFixed(2)}${k.kpi.unit === 'percent' ? '%' : ''} (Objetivo: ${parseFloat(k.kpi.target_value).toFixed(2)})`
        ).join('\n');

        const prompt = `
Eres el "Director de Operaciones Algorítmico" analizando el Cuadro de Mando Integral de la firma Grupo HORECA Demo (Restaurante A, Restaurante C, Restaurante B).
A continuación se listan los KPIs actuales en alcance: ${scope === 'global' ? 'Franquicia Global' : 'Local Individual'}.

Identifica el mayor problema (desviación respecto a objetivo) y propón una "Inferencia Estratégica" muy concreta. 
Usa lenguaje técnico HORECA y de negocios (EBITDA, Food Cost, Escandallos, RevPASH, etc.).

Devuelve ESTRICTAMENTE un JSON con esta estructura exacta y NADA MÁS:
{
  "deteccion": "Descripción de 2 frases del hallazgo negativo o positivo más clave",
  "recomendacion": "1 frase con recomendación directiva de impacto"
}

KPIs ACTUALES:
${contextStr}
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile', // Modelo rapidísimo de Groq
            response_format: { type: 'json_object' }
        });

        const output = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(output);

    } catch (error) {
        console.error('Groq API Error:', error);
        res.status(500).json({ error: 'Fallo al contactar con LLM' });
    }
});

module.exports = router;
