export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Apenas POST permitido' });
    }

    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN;

    try {
        // ATUALIZADO: Usando a nova URL router.huggingface.co
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/v1/objects/Tongyi-MAI/Z-Image-Turbo",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: prompt,
                    parameters: {
                        // O modelo Z-Image-Turbo ignora isso, mas ajuda a manter o padrão
                        num_inference_steps: 1 
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Erro HF:", errorData);
            return res.status(response.status).json({ error: "Erro na API do Hugging Face. Verifique se o modelo está online." });
        }

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        console.error("Erro Interno:", error);
        return res.status(500).json({ error: "Erro interno no servidor: " + error.message });
    }
}
