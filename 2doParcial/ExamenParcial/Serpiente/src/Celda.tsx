import type { Contenido } from './juego';

interface CeldaProps {
    contenido: Contenido;
}

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
