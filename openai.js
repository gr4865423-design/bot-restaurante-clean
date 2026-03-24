import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function entenderMensagem(msg) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um assistente de restaurante.

Extraia da mensagem:
- data (YYYY-MM-DD)
- horario (HH:mm)
- pessoas (numero)

Responda SOMENTE em JSON:
{
  "data": "",
  "horario": "",
  "pessoas": ""
}

Se não tiver algum campo, deixe vazio.
`
        },
        {
          role: "user",
          content: msg
        }
      ]
    });

    const texto = response.choices[0].message.content;

    return JSON.parse(texto);
  } catch (e) {
    console.error("Erro IA:", e);
    return {};
  }
}