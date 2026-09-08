import express from "express";
// Se importa con extension .js aunque el archivo sea .ts:
// el proyecto usa "module": "NodeNext", asi se resuelve en tiempo de ejecucion.
import { mejorMovimiento, ganador, type Tablero, type Marca } from "./minimax.js";

const app = express();
const puerto = 3000;

// Convierte el body JSON de la peticion en un objeto (req.body).
// Sin esto, req.body llega undefined.
app.use(express.json());

app.get("/saludo", (req, res) => {
    return res.json({
        message: "Hola como json"
    });
});

app.post("/api/jugar", (req, res) => {
    const tablero = req.body.tablero as Tablero;
    const turno = req.body.turno as Marca;

    const indice = mejorMovimiento(tablero, turno);

    // indice === -1 significa que la partida ya estaba terminada: no se juega nada.
    const tableroActualizado: Tablero = [...tablero];
    if (indice !== -1) {
        tableroActualizado[indice] = turno;
    }

    const ganadorActual = ganador(tableroActualizado);
    const lleno = tableroActualizado.every((celda) => celda !== null);
    const estado = ganadorActual !== null ? "ganado" : lleno ? "empate" : "en_curso";

    res.json({
        tablero: tableroActualizado,
        indice,
        estado,
        ganador: ganadorActual
    });
});

app.listen(puerto, () => {
console.log("servidor iniciado");
});
