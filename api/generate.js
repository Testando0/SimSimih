export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN; // Aqui pegamos a variável do Vercel

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Tongyi-MAI/Z-Image-Turbo",
            {
                headers: { 
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) throw new Error('Falha na API do Hugging Face');

        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
