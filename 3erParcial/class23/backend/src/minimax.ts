export type Marca = 'X' | 'O';
export type Celda = Marca | null;
export type Tablero = Celda[];

const LINEAS_GANADORAS: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const ganador = (tablero: Tablero): Marca | null => {
  for (const [a, b, c] of LINEAS_GANADORAS) {
    if (
      tablero[a] !== null &&
      tablero[a] === tablero[b] &&
      tablero[a] === tablero[c]
    ) {
      return tablero[a];
    }
  }

  return null;
};

const oponente = (jugador: Marca): Marca => {
  return jugador === 'X' ? 'O' : 'X';
};

const resultado = (tablero: Tablero, pc: Marca): number | null => {
  const ganadorActual = ganador(tablero);
  const persona: Marca = oponente(pc);

  if (ganadorActual === pc) return 1;
  if (ganadorActual === persona) return -1;
  if (tablero.every((celda) => celda !== null)) return 0;

  return null;
};

const minimax = (
  tablero: Tablero,
  jugador: Marca,
  pc: Marca,
): number => {
  const resultadoActual = resultado(tablero, pc);
  if (resultadoActual !== null) return resultadoActual;

  const puntajes = tablero
    .map((celda, indice) => (celda === null ? indice : -1))
    .filter((indice) => indice !== -1)
    .map((indice) => {
      const siguiente = [...tablero];
      siguiente[indice] = jugador;

      return minimax(siguiente, oponente(jugador), pc);
    });

  return jugador === pc ? Math.max(...puntajes) : Math.min(...puntajes);
};

export const mejorMovimiento = (tablero: Tablero, pc: Marca): number => {
  if (resultado(tablero, pc) !== null) return -1;

  let mejorIndice = -1;
  let mejorPuntaje = -Infinity;

  tablero.forEach((celda, indice) => {
    if (celda !== null) return;

    const siguiente = [...tablero];
    siguiente[indice] = pc;
    const puntaje = minimax(siguiente, oponente(pc), pc);

    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorIndice = indice;
    }
  });

  return mejorIndice;
};
