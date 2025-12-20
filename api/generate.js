export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN;

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Tongyi-MAI/Z-Image-Turbo",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: prompt,
                    options: { wait_for_model: true } // ESSENCIAL: Evita erro 503 enquanto o modelo liga
                }),
            }
        );

        // Se o erro for 503 (ainda carregando), avisamos o usuário
        if (response.status === 503) {
            return res.status(503).json({ error: "O modelo está acordando... tente novamente em 15 segundos." });
        }

        if (!response.ok) {
            const errData = await response.json();
            return res.status(response.status).json({ error: errData.error || "Falha na API" });
        }

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        return res.status(500).json({ error: "Erro interno: " + error.message });
    }
}
