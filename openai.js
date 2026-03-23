import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function entenderMensagem(msg) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Você é um atendente de restaurante.

Extraia:
- intencao (reserva, cancelar, alterar, duvida)
- data (YYYY-MM-DD)
- horario (HH:mm)
- pessoas (numero)

Responda apenas JSON.
        `
      },
      {
        role: "user",
        content: msg
      }
    ]
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return { intencao: "duvida" };
  }
}