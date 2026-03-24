import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";

import { entenderMensagem } from "./openai.js";
import { getUser, salvarReserva } from "./fluxos.js";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const MessagingResponse = twilio.twiml.MessagingResponse;

// 🔥 WEBHOOK PRINCIPAL
app.post("/webhook", async (req, res) => {
  try {
    const twiml = new MessagingResponse();

    const msg = req.body.Body;
    const numero = req.body.From || "teste";

    console.log("📩 Mensagem recebida:", msg);

    const user = getUser(numero);

    let ia = {};

    try {
      ia = await entenderMensagem(msg);
      console.log("🧠 IA respondeu:", ia);
    } catch (error) {
      console.log("❌ ERRO OPENAI:", error);
      ia = { intencao: "duvida" };
    }

    if (ia.data) user.dados.data = ia.data;
    if (ia.horario) user.dados.horario = ia.horario;
    if (ia.pessoas) user.dados.pessoas = ia.pessoas;

    // ✅ Se já tem tudo → confirma reserva
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

    // 🔄 Fluxo de perguntas
    if (!user.dados.data) {
      twiml.message("Qual dia deseja reservar? 📅");
    } else if (!user.dados.horario) {
      twiml.message("Qual horário? ⏰");
    } else if (!user.dados.pessoas) {
      twiml.message("Para quantas pessoas? 👥");
    } else {
      twiml.message("Não entendi, pode reformular?");
    }

    res.type("text/xml").send(twiml.toString());

  } catch (err) {
    console.log("💥 ERRO GERAL:", err);

    const twiml = new MessagingResponse();
    twiml.message("Erro interno 😢 tente novamente");

    res.type("text/xml").send(twiml.toString());
  }
});

// 🌐 ROTA TESTE (opcional)
app.get("/", (req, res) => {
  res.send("🔥 BOT RODANDO");
});

// 🚀 START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando 🚀 na porta ${PORT}`);
});