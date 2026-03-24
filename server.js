import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  const msg = req.body.Body;

  console.log("Mensagem recebida:", msg);

  twiml.message("🔥 BOT ONLINE FUNCIONANDO");

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando 🚀");
});