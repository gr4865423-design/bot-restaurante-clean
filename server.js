import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import pkg from "twilio";
const { twiml: { MessagingResponse } } = pkg;

import { entenderMensagem } from "./openai.js";
import { getUser, salvarReserva } from "./fluxos.js";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", async (req, res) => {
  try {
    const twiml = new MessagingResponse();

    const msg = req.body.Body?.trim();
    const numero = req.body.From;

    const user = getUser(numero);

    // 🔥 IA ENTENDE A MENSAGEM
    const ia = await entenderMensagem(msg);

    if (ia.data) user.dados.data = ia.data;
    if (ia.horario) user.dados.horario = ia.horario;
    if (ia.pessoas) user.dados.pessoas = ia.pessoas;

    // 🔥 FLUXO INTELIGENTE

    if (!user.dados.data) {
      twiml.message("📅 Qual dia deseja reservar?");
      return res.type("text/xml").send(twiml.toString());
    }

    if (!user.dados.horario) {
      twiml.message("⏰ Qual horário?");
      return res.type("text/xml").send(twiml.toString());
    }

    if (!user.dados.pessoas) {
      twiml.message("👥 Para quantas pessoas?");
      return res.type("text/xml").send(twiml.toString());
    }

    // 🔥 CONFIRMAÇÃO BONITA
    const reserva = salvarReserva(numero, user.dados);

    user.dados = {};

    twiml.message(`✨ *Reserva Confirmada!* ✨

📅 *Data:* ${reserva.data}
⏰ *Horário:* ${reserva.horario}
👥 *Pessoas:* ${reserva.pessoas}

🍕 Estamos te esperando!
Qualquer alteração é só avisar 😉`);

    return res.type("text/xml").send(twiml.toString());

  } catch (error) {
    console.error("ERRO:", error);
    return res.status(200).send("Erro interno");
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando 🚀");
});