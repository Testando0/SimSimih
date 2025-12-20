export default async function handler(req, res) {
    // 1. Bloqueia métodos que não sejam POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN;

    // 2. Verifica se você configurou o Token no Vercel
    if (!HF_TOKEN) {
        return res.status(500).json({ error: 'HF_TOKEN não configurado no painel do Vercel.' });
    }

    try {
        // URL Oficial e Estável (Sem erros de DNS)
        const response = await fetch(
            "https://api-inference.huggingface.co/models/ByteDance/SDXL-Lightning-4step",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: prompt,
                    options: { 
                        wait_for_model: true, // Acorda o modelo se ele estiver dormindo
                        use_cache: false 
                    }
                }),
            }
        );

        // 3. Se o Token estiver errado ou a cota acabar
        if (response.status === 401 || response.status === 403) {
            return res.status(401).json({ error: 'Token inválido ou expirado. Gere um novo no Hugging Face.' });
        }

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Hugging Face Error: ${response.status}` });
        }

        // 4. Converte o resultado para buffer e envia a imagem
        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        console.error("Erro no Servidor:", error);
        return res.status(500).json({ error: "Erro de conexão: " + error.message });
    }
}
