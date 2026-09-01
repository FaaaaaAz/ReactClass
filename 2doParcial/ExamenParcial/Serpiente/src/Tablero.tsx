import type { Posicion } from './juego';
import { indices, contenidoDeCelda } from './juego';
import Celda from './Celda';

interface TableroProps {
    serpiente: Posicion[];
    comida: Posicion;
    perdido: boolean;
}

export default function Tablero({ serpiente, comida, perdido }: TableroProps) {

    const clase: string = perdido ? 'tablero tablero-choque' : 'tablero';

    return (
        <table className={clase}>
            <tbody>
                {indices.map((fila) => {
                    return (
                        <tr key={fila}>
                            {indices.map((columna) => {
                                const posicion: Posicion = { fila: fila, columna: columna };
                                return (
                                    <Celda
                                        key={fila + '-' + columna}
                                        contenido={contenidoDeCelda(posicion, serpiente, comida)}
                                    />
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
