// Datos y funciones del juego de la serpiente.
// Aqui no hay JSX: solo tipos de TypeScript y operaciones normales.

export type Posicion = {
    fila: number;
    columna: number;
};

// Que hay dentro de una celda del tablero
export type Contenido = 'cabeza' | 'cuerpo' | 'comida' | 'vacia';

// Como va la partida
export type Resultado = 'jugando' | 'perdido' | 'ganado';

// Indices de las 8 filas y las 8 columnas del tablero
export const indices: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

export const totalFilas: number = indices.length;
export const totalColumnas: number = indices.length;
export const totalCeldas: number = totalFilas * totalColumnas;

// La serpiente empieza con 3 segmentos. El primero de la lista es la cabeza.
export const serpienteInicial: Posicion[] = [
    { fila: 4, columna: 3 },
    { fila: 4, columna: 2 },
    { fila: 4, columna: 1 },
];

// Primera comida en una celda que no ocupa la serpiente
export const comidaInicial: Posicion = { fila: 1, columna: 6 };

export const sonIguales = (primera: Posicion, segunda: Posicion): boolean => {
    return primera.fila === segunda.fila && primera.columna === segunda.columna;
};

// Indica si una posicion coincide con algun segmento de la lista
export const estaOcupada = (segmentos: Posicion[], posicion: Posicion): boolean => {
    return segmentos.some((segmento) => {
        return sonIguales(segmento, posicion);
    });
};

export const estaFueraDelTablero = (posicion: Posicion): boolean => {
    return (
        posicion.fila < 0 ||
        posicion.fila >= totalFilas ||
        posicion.columna < 0 ||
        posicion.columna >= totalColumnas
    );
};

// Elige al azar una celda libre para la nueva comida
export const generarComida = (serpiente: Posicion[]): Posicion => {
    const libres: Posicion[] = [];

    indices.forEach((fila) => {
        indices.forEach((columna) => {
            const posicion: Posicion = { fila: fila, columna: columna };
            if (!estaOcupada(serpiente, posicion)) {
                libres.push(posicion);
            }
        });
    });

    const indice: number = Math.floor(Math.random() * libres.length);
    return libres[indice];
};

// Decide que se dibuja en una celda: la cabeza, el cuerpo, la comida o nada
export const contenidoDeCelda = (
    posicion: Posicion,
    serpiente: Posicion[],
    comida: Posicion
): Contenido => {
    if (sonIguales(serpiente[0], posicion)) {
        return 'cabeza';
    }
    if (estaOcupada(serpiente, posicion)) {
        return 'cuerpo';
    }
    if (sonIguales(comida, posicion)) {
        return 'comida';
    }
    return 'vacia';
};
