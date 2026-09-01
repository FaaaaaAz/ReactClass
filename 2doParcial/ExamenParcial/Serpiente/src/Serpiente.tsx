import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Posicion, Resultado } from './juego';
import {
    comidaInicial,
    estaFueraDelTablero,
    estaOcupada,
    generarComida,
    serpienteInicial,
    sonIguales,
    totalCeldas,
} from './juego';
import Tablero from './Tablero';
import Mensaje from './Mensaje';

export default function Serpiente() {
    const [serpiente, setSerpiente] = useState<Posicion[]>(serpienteInicial);
    const [comida, setComida] = useState<Posicion>(comidaInicial);
    const [resultado, setResultado] = useState<Resultado>('jugando');

    const comidas: number = serpiente.length - serpienteInicial.length;

    const mover = (avanceFila: number, avanceColumna: number): void => {
        if (resultado !== 'jugando') {
            return;
        }

        const cabeza: Posicion = serpiente[0];
        const nuevaCabeza: Posicion = {
            fila: cabeza.fila + avanceFila,
            columna: cabeza.columna + avanceColumna,
        };

        if (estaFueraDelTablero(nuevaCabeza)) {
            setResultado('perdido');
            return;
        }

        const come: boolean = sonIguales(nuevaCabeza, comida);

        const cuerpo: Posicion[] = come
            ? serpiente
            : serpiente.slice(0, serpiente.length - 1);

        if (estaOcupada(cuerpo, nuevaCabeza)) {
            setResultado('perdido');
            return;
        }

        const nuevaSerpiente: Posicion[] = [nuevaCabeza].concat(cuerpo);
        setSerpiente(nuevaSerpiente);

        if (come) {
            if (nuevaSerpiente.length === totalCeldas) {
                setResultado('ganado');
            } else {
                setComida(generarComida(nuevaSerpiente));
            }
        }
    };

    const manejarTecla = (evento: KeyboardEvent<HTMLDivElement>): void => {
        if (evento.key === 'ArrowUp') {
            mover(-1, 0);
        }
        if (evento.key === 'ArrowDown') {
            mover(1, 0);
        }
        if (evento.key === 'ArrowLeft') {
            mover(0, -1);
        }
        if (evento.key === 'ArrowRight') {
            mover(0, 1);
        }
    };

    const reiniciar = (): void => {
        setSerpiente(serpienteInicial);
        setComida(comidaInicial);
        setResultado('jugando');
    };

    return (
        <div className="juego" tabIndex={0} onKeyDown={manejarTecla}>
            <h1>Serpiente</h1>
            <p className="ayuda">
                Haz clic en el tablero y usa las flechas ↑ ↓ ← →. Cada flecha es un turno.
            </p>

            <Tablero
                serpiente={serpiente}
                comida={comida}
                perdido={resultado === 'perdido'}
            />

            <Mensaje resultado={resultado} comidas={comidas} />

            <button onClick={reiniciar}>Reiniciar</button>
        </div>
    );
}
