export default async (req, res) => {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { landingUrl } = req.body;
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    // Validar que venga la URL
    if (!landingUrl) {
        return res.status(400).json({ error: 'Landing URL requerida' });
    }

    // Validar que exista la API Key
    if (!API_KEY) {
        console.error('ANTHROPIC_API_KEY no configurada');
        return res.status(500).json({ error: 'API Key no configurada en Vercel' });
    }

    try {
        console.log('Llamando Claude API para:', landingUrl);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: `Basándote en esta URL de landing: ${landingUrl}

Genera 4 variaciones DIFERENTES de copy para anuncios de Meta Ads. Cada variación debe incluir:
- Un titular cautivador (máximo 128 caracteres)
- Una descripción persuasiva (máximo 256 caracteres)

Las 4 variaciones deben ser:
1. Enfocada en BENEFICIO principal
2. Enfocada en URGENCIA/ESCASEZ
3. Enfocada en SOCIAL PROOF/TESTIMONIOS
4. Enfocada en CALL TO ACTION fuerte

Responde SOLO en formato JSON válido, sin markdown:
{
  "copies": [
    {"numero": 1, "titulo": "...", "descripcion": "..."},
    {"numero": 2, "titulo": "...", "descripcion": "..."},
    {"numero": 3, "titulo": "...", "descripcion": "..."},
    {"numero": 4, "titulo": "...", "descripcion": "..."}
  ]
}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Claude API Error:', error);
            return res.status(response.status).json({ 
                error: `Error de Claude API: ${response.statusText}` 
            });
        }

        const data = await response.json();
        
        if (!data.content || !data.content[0] || !data.content[0].text) {
            console.error('Respuesta inválida de Claude:', data);
            return res.status(500).json({ 
                error: 'Formato de respuesta inválido de Claude' 
            });
        }

        const content = data.content[0].text;
        console.log('Respuesta de Claude:', content.substring(0, 200));

        // Extraer JSON de la respuesta
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No se encontró JSON en:', content);
            return res.status(500).json({ 
                error: 'No se pudo extraer JSON de la respuesta' 
            });
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Copies generados:', parsed.copies.length);

        res.status(200).json(parsed);

    } catch (error) {
        console.error('Error en servidor:', error);
        res.status(500).json({ 
            error: 'Error en servidor: ' + error.message 
        });
    }
};
