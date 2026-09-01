import type { Contenido } from './juego';

interface CeldaProps {
    contenido: Contenido;
}

// La cabeza y la comida ademas del color llevan un emoji
const obtenerTexto = (contenido: Contenido): string => {
    if (contenido === 'cabeza') {
        return '🐍';
    }
    if (contenido === 'comida') {
        return '🍎';
    }
    return '';
};

export default function Celda({ contenido }: CeldaProps) {
    return (
        <td className={'celda celda-' + contenido}>
            {obtenerTexto(contenido)}
        </td>
    );
}
