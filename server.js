import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import pkg from "twilio";
const { twiml: { MessagingResponse } } = pkg;

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", (req, res) => {
  console.log("🔥 WEBHOOK CHAMADO");

  const twiml = new MessagingResponse();
  twiml.message("🔥 FUNCIONANDO 100%");

  res.type("text/xml").send(twiml.toString());
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Servidor rodando 🚀");
});