export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { landingUrl } = req.body;
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!landingUrl) {
        return res.status(400).json({ error: 'Landing URL requerida' });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en Vercel' });
    }

    try {
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

Responde SOLO en formato JSON válido:
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
            const error = await response.json();
            console.error('Error creating campaign:', error);
            return res.status(500).json({ error: 'Error de Claude API' });
        }

        const data = await response.json();
        const content = data.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            return res.status(500).json({ error: 'No JSON found in response' });
        }

        const parsed = JSON.parse(jsonMatch[0]);
        res.status(200).json(parsed);

    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
