import type { Resultado } from './juego';

interface MensajeProps {
    resultado: Resultado;
    comidas: number;
}

// Renderizado condicional: el mensaje cambia segun como va la partida
export default function Mensaje({ resultado, comidas }: MensajeProps) {
    if (resultado === 'perdido') {
        return (
            <p className="mensaje mensaje-perdido">
                💥 Juego terminado: la serpiente chocó. Comidas: {comidas}
            </p>
        );
    }

    if (resultado === 'ganado') {
        return (
            <p className="mensaje mensaje-ganado">
                🎉 ¡Ganaste! La serpiente llenó el tablero. Comidas: {comidas}
            </p>
        );
    }

    return <p className="mensaje">Comidas: {comidas}</p>;
}
