import { usuarios, reservas } from "./db.js";
import { v4 as uuidv4 } from "uuid";

export function getUser(numero) {
  if (!usuarios[numero]) {
    usuarios[numero] = {
      etapa: "inicio",
      dados: {}
    };
  }
  return usuarios[numero];
}

export function salvarReserva(numero, dados) {
  const reserva = {
    id: uuidv4(),
    numero,
    ...dados
  };

  reservas.push(reserva);
  return reserva;
}