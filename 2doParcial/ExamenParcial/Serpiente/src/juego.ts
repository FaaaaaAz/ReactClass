export type Posicion = {
    fila: number;
    columna: number;
};

export type Contenido = 'cabeza' | 'cuerpo' | 'comida' | 'vacia';

export type Resultado = 'jugando' | 'perdido' | 'ganado';

export const indices: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

export const totalFilas: number = indices.length;
export const totalColumnas: number = indices.length;
export const totalCeldas: number = totalFilas * totalColumnas;

export const serpienteInicial: Posicion[] = [
    { fila: 4, columna: 3 },
    { fila: 4, columna: 2 },
    { fila: 4, columna: 1 },
];

export const comidaInicial: Posicion = { fila: 1, columna: 6 };

export const sonIguales = (primera: Posicion, segunda: Posicion): boolean => {
    return primera.fila === segunda.fila && primera.columna === segunda.columna;
};

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
