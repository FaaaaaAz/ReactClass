import { useState } from "react";
import "./TresEnRaya.css";

type Marca = "X" | "O";
type Celda = Marca | null;
type Tablero = Celda[];
type Estado = "en_curso" | "ganado" | "empate";

type RespuestaJugar = {
tablero: Tablero;
indice: number;
estado: Estado;
ganador: Marca | null;
};

const PERSONA: Marca = "X";
const PC: Marca = "O";

const TABLERO_VACIO: Tablero = [null, null, null, null, null, null, null, null, null];

// URL relativa: el proxy de Vite la reenvia al backend (:3000).
async function jugar(tablero: Tablero): Promise<RespuestaJugar> {
const response = await fetch("/api/jugar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tablero, turno: PC }),
});

if (!response.ok) {
    throw new Error(`El servidor respondio ${response.status}`);
}

return response.json();
}

function TresEnRaya() {
const [tablero, setTablero] = useState<Tablero>(TABLERO_VACIO);
const [estado, setEstado] = useState<Estado>("en_curso");
const [ganador, setGanador] = useState<Marca | null>(null);
const [pensando, setPensando] = useState(false);
const [error, setError] = useState<string | null>(null);

const terminado = estado !== "en_curso";

const clickCelda = async (indice: number) => {
    if (terminado || pensando || tablero[indice] !== null) return;

    const conJugada: Tablero = [...tablero];
    conJugada[indice] = PERSONA;

    setTablero(conJugada); // se ve la X al instante, sin esperar al servidor
    setPensando(true);
    setError(null);

    try {
    const respuesta = await jugar(conJugada);
    setTablero(respuesta.tablero);
    setEstado(respuesta.estado);
    setGanador(respuesta.ganador);
    } catch (e) {
    setTablero(tablero);
    setError(e instanceof Error ? e.message : "No se pudo conectar con el servidor");
    } finally {
    setPensando(false);
    }
};

const reiniciar = () => {
    setTablero(TABLERO_VACIO);
    setEstado("en_curso");
    setGanador(null);
    setError(null);
    setPensando(false);
};

const mensaje = () => {
    if (error) return error;
    if (estado === "empate") return "Empate";
    if (estado === "ganado") return ganador === PERSONA ? "Ganaste" : "Gano la maquina";
    if (pensando) return "Pensando...";
    return "Tu turno";
};

return (
    <div className="juego">
    <h1>Tres en raya</h1>

    <p className={`estado ${error ? "estado--error" : ""}`}>{mensaje()}</p>

    <div className="tablero">
        {tablero.map((celda, indice) => (
        <button
            key={indice}
            className={`celda ${celda ? `celda--${celda.toLowerCase()}` : ""}`}
            onClick={() => clickCelda(indice)}
            disabled={terminado || pensando || celda !== null}
        >
            {celda}
        </button>
        ))}
    </div>

    <button className="reiniciar" onClick={reiniciar}>
        Reiniciar
    </button>
    </div>
);
}

export default TresEnRaya;
