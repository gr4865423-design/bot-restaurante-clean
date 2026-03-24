import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import { getUser, salvarReserva } from "./fluxos.js";

import twilio from "twilio";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  const msg = req.body.Body?.trim();
  const numero = req.body.From || "teste";

  const user = getUser(numero);

  // 🔥 FLUXO INTELIGENTE SEM IA

  if (!user.dados.data) {
    user.dados.data = msg;
    twiml.message("Qual horário deseja? ⏰");
    return res.type("text/xml").send(twiml.toString());
  }

  if (!user.dados.horario) {
    user.dados.horario = msg;
    twiml.message("Para quantas pessoas? 👥");
    return res.type("text/xml").send(twiml.toString());
  }

  if (!user.dados.pessoas) {
    user.dados.pessoas = msg;

    const reserva = salvarReserva(numero, user.dados);

    user.dados = {};

    twiml.message(`✅ Reserva confirmada!

📅 ${reserva.data}
⏰ ${reserva.horario}
👥 ${reserva.pessoas} pessoas

Aguardamos você 🍕🔥`);

    return res.type("text/xml").send(twiml.toString());
  }

  // fallback
  twiml.message("Não entendi, pode reformular?");
  res.type("text/xml").send(twiml.toString());
});

app.listen(3000, () => {
  console.log("Servidor rodando 🚀");
});