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
  const twiml = new MessagingResponse();

  try {
    const msg = req.body.Body?.trim();
    const numero = req.body.From;

    console.log("📩 MSG:", msg);

    const user = getUser(numero);

    // 🔥 IA SEGURA (não quebra o sistema)
    let ia = {};

    try {
      ia = await entenderMensagem(msg);
      console.log("🤖 IA:", ia);
    } catch (e) {
      console.log("⚠️ Erro IA, ignorando...");
    }

    // salva dados se IA entender
    if (ia?.data) user.dados.data = ia.data;
    if (ia?.horario) user.dados.horario = ia.horario;
    if (ia?.pessoas) user.dados.pessoas = ia.pessoas;

    // 🧠 fallback manual (garante funcionamento)
    if (!ia?.data && !user.dados.data) {
      if (msg.match(/\d{2}\/\d{2}/) || msg.toLowerCase().includes("amanhã")) {
        user.dados.data = msg;
      }
    }

    if (!ia?.horario && !user.dados.horario) {
      if (msg.match(/\d{1,2}h/)) {
        user.dados.horario = msg;
      }
    }

    if (!ia?.pessoas && !user.dados.pessoas) {
      if (msg.match(/\d+/)) {
        user.dados.pessoas = msg;
      }
    }

    // 🔥 FLUXO

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

    // 🎉 CONFIRMAÇÃO BONITA
    const reserva = salvarReserva(numero, user.dados);

    user.dados = {};

    twiml.message(`✨ *Reserva Confirmada!* ✨

📅 *Data:* ${reserva.data}
⏰ *Horário:* ${reserva.horario}
👥 *Pessoas:* ${reserva.pessoas}

🍕 Estamos te esperando!
Se precisar alterar, é só avisar 😉`);

    return res.type("text/xml").send(twiml.toString());

  } catch (error) {
    console.error("💥 ERRO GERAL:", error);

    // 🔥 NUNCA MAIS 502
    twiml.message("⚠️ Tivemos um erro, tente novamente.");

    return res.type("text/xml").send(twiml.toString());
  }
});

// rota teste (opcional)
app.get("/", (req, res) => {
  res.send("Servidor online 🚀");
});

app.listen(3000, () => {
  console.log("Servidor rodando 🚀");
});