import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import { entenderMensagem } from "./openai.js";
import { getUser, salvarReserva } from "./fluxos.js";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", async (req, res) => {
  const msg = req.body.Body;
  const numero = req.body.From || "teste";

  const user = getUser(numero);

  const ia = await entenderMensagem(msg);

  if (ia.data) user.dados.data = ia.data;
  if (ia.horario) user.dados.horario = ia.horario;
  if (ia.pessoas) user.dados.pessoas = ia.pessoas;

  if (user.dados.data && user.dados.horario && user.dados.pessoas) {
    const reserva = salvarReserva(numero, user.dados);

    user.dados = {};

    return res.send(`
✅ Reserva confirmada!

📅 ${reserva.data}
⏰ ${reserva.horario}
👥 ${reserva.pessoas} pessoas

Aguardamos você 🍕🔥
`);
  }

  if (!user.dados.data) {
    return res.send("Qual dia deseja reservar? 📅");
  }

  if (!user.dados.horario) {
    return res.send("Qual horário? ⏰");
  }

  if (!user.dados.pessoas) {
    return res.send("Para quantas pessoas? 👥");
  }

  res.send("Não entendi, pode reformular?");
});

app.listen(3000, () => {
  console.log("Servidor rodando 🚀");
});