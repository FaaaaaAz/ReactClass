import { useEffect, useState } from "react";

function SpaceInvaders() {
    const [posicionHorizontal, setPosicionHorizontal] = useState<number>(window.innerWidth / 2)
    const [posicionVertical, setPosicionVertical] = useState<number>(5)

    useEffect(() => {
        const actualizarPosicionHorizontal = () => {
            setPosicionHorizontal(window.innerWidth / 2)
        }

        window.addEventListener('resize', actualizarPosicionHorizontal);

        return () => {
            window.removeEventListener('resize', actualizarPosicionHorizontal)
        }
    }, []);

    useEffect(() => {
        const identificadorIntervalo: number = setInterval(() => {
            setPosicionVertical((posicionAnterior) => posicionAnterior + 5)
        }, 1000)

        return () => {
            clearInterval(identificadorIntervalo)
        }
    }, [])

    return (
        <>
            <div className="base-jugador">
                Base
            </div>
            <div style={{
                position: 'absolute',
                width: '5rem',
                height: '5rem',
                left: `${posicionHorizontal}px`,
                bottom: `${posicionVertical}rem`,
                background: '#22c55e'
            }}>
                Objetivo
            </div>
        </>
    );
}

export default SpaceInvaders;
