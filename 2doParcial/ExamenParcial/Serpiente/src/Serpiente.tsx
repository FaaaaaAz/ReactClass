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
    // Estado: la serpiente (lista de segmentos), la comida y el resultado
    const [serpiente, setSerpiente] = useState<Posicion[]>(serpienteInicial);
    const [comida, setComida] = useState<Posicion>(comidaInicial);
    const [resultado, setResultado] = useState<Resultado>('jugando');

    // Cuantas comidas se alcanzaron: la serpiente empezo con 3 segmentos
    const comidas: number = serpiente.length - serpienteInicial.length;

    // Un turno: la cabeza avanza una celda en la direccion indicada
    const mover = (avanceFila: number, avanceColumna: number): void => {
        if (resultado !== 'jugando') {
            return;
        }

        const cabeza: Posicion = serpiente[0];
        const nuevaCabeza: Posicion = {
            fila: cabeza.fila + avanceFila,
            columna: cabeza.columna + avanceColumna,
        };

        // Choque contra el borde: el juego termina
        if (estaFueraDelTablero(nuevaCabeza)) {
            setResultado('perdido');
            return;
        }

        const come: boolean = sonIguales(nuevaCabeza, comida);

        // El cuerpo sigue a la cabeza. Si no come, se elimina el ultimo segmento.
        const cuerpo: Posicion[] = come
            ? serpiente
            : serpiente.slice(0, serpiente.length - 1);

        // Choque con el propio cuerpo: el juego termina
        if (estaOcupada(cuerpo, nuevaCabeza)) {
            setResultado('perdido');
            return;
        }

        const nuevaSerpiente: Posicion[] = [nuevaCabeza].concat(cuerpo);
        setSerpiente(nuevaSerpiente);

        if (come) {
            // Al comer, la serpiente ya crecio: falta poner la siguiente comida
            if (nuevaSerpiente.length === totalCeldas) {
                setResultado('ganado');
            } else {
                setComida(generarComida(nuevaSerpiente));
            }
        }
    };

    // Cada pulsacion de una flecha representa un turno
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

    // tabIndex permite que el div reciba el foco y por tanto las teclas
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
