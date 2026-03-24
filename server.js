import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";

import { entenderMensagem } from "./openai.js";
import { getUser, salvarReserva } from "./fluxos.js";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", async (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  const msg = req.body.Body;
  const numero = req.body.From;

  console.log("Mensagem:", msg);

  const user = getUser(numero);
  const ia = await entenderMensagem(msg);

  if (ia.data) user.dados.data = ia.data;
  if (ia.horario) user.dados.horario = ia.horario;
  if (ia.pessoas) user.dados.pessoas = ia.pessoas;

  if (user.dados.data && user.dados.horario && user.dados.pessoas) {
    const reserva = salvarReserva(numero, user.dados);

    user.dados = {};

    twiml.message(`
✅ Reserva confirmada!

📅 ${reserva.data}
⏰ ${reserva.horario}
👥 ${reserva.pessoas} pessoas

Aguardamos você 🍕🔥
`);
    
    return res.type("text/xml").send(twiml.toString());
  }

  if (!user.dados.data) {
    twiml.message("Qual dia deseja reservar? 📅");
    return res.type("text/xml").send(twiml.toString());
  }

  if (!user.dados.horario) {
    twiml.message("Qual horário? ⏰");
    return res.type("text/xml").send(twiml.toString());
  }

  if (!user.dados.pessoas) {
    twiml.message("Para quantas pessoas? 👥");
    return res.type("text/xml").send(twiml.toString());
  }

  twiml.message("Não entendi, pode reformular?");
  res.type("text/xml").send(twiml.toString());
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando 🚀");
});