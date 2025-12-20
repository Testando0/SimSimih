export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN;

    try {
        // NOVA URL DO ROUTER (Padrão 2025)
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/v1/objects/black-forest-labs/FLUX.1-schnell",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false"
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: 4 // Otimizado para o modelo Schnell
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Erro do Router:", errorData);
            
            // Se o Router der erro 404 ou 410, usamos o fallback para o modelo turbo
            return res.status(response.status).json({ 
                error: `Router Error: ${response.status}`,
                details: "Verifique se o seu Token tem permissão de Inference no HF."
            });
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // Configura os headers para retornar a imagem corretamente
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        return res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        console.error("Erro Interno:", error);
        return res.status(500).json({ error: "Erro no servidor Vercel: " + error.message });
    }
}
