import { useEffect, useState } from "react";
import naveImg from "./assets/nave.png";
import alienImg from "./assets/alien.png";
import piedraImg from "./assets/piedra.png";

type Bloque = {
    x: number
    y: number
}

const PROPORCION_BLOQUE = 0.07
const PROPORCION_DISPARO = PROPORCION_BLOQUE / 2
const NUMERO_EXTRATERRESTRES = 5
const PROPORCION_PASO_BASE = 0.03

function obtenerAnchoJuego() {
    const contenedor = document.getElementById('root')
    return contenedor ? contenedor.clientWidth : window.innerWidth
}

function obtenerAltoJuego() {
    return window.innerHeight
}

function obtenerAltoBase() {
    const base = document.querySelector<HTMLDivElement>('.base-jugador')
    return base ? base.clientHeight : obtenerAltoJuego() * 0.06
}

function obtenerAnchoBase() {
    const base = document.querySelector<HTMLDivElement>('.base-jugador')
    return base ? base.clientWidth : obtenerAnchoJuego() * 0.14
}

function obtenerTamanoBloque(alto: number) {
    return alto * PROPORCION_BLOQUE
}

function obtenerTamanoDisparo(alto: number) {
    return alto * PROPORCION_DISPARO
}

function crearFilaDeExtraterrestres(ancho: number, alto: number): Array<Bloque> {
    const tamanoBloque = obtenerTamanoBloque(alto)
    const espacio = (ancho - tamanoBloque * NUMERO_EXTRATERRESTRES) / (NUMERO_EXTRATERRESTRES + 1)

    return Array.from({ length: NUMERO_EXTRATERRESTRES }, (_, indice) => ({
        x: espacio + indice * (tamanoBloque + espacio),
        y: 0
    }))
}

function SpaceInvaders() {
    const [anchoJuego, setAnchoJuego] = useState<number>(obtenerAnchoJuego)
    const [altoJuego, setAltoJuego] = useState<number>(obtenerAltoJuego)
    const [altoBase, setAltoBase] = useState<number>(obtenerAltoBase)
    const [anchoBase, setAnchoBase] = useState<number>(obtenerAnchoBase)

    const [posicionBase, setPosicionBase] = useState<number>(
        () => (obtenerAnchoJuego() - obtenerAnchoBase()) / 2
    )

    const [disparos, setDisparos] = useState<Array<Bloque>>([])

    const [extraterrestres, setExtraterrestres] = useState<Array<Bloque>>(
        () => crearFilaDeExtraterrestres(obtenerAnchoJuego(), obtenerAltoJuego())
    )

    const tamanoBloque = obtenerTamanoBloque(altoJuego)
    const tamanoDisparo = obtenerTamanoDisparo(altoJuego)

    useEffect(() => {
        const actualizarDimensiones = () => {
            const nuevoAncho = obtenerAnchoJuego()
            const nuevoAlto = obtenerAltoJuego()
            const nuevoAltoBase = obtenerAltoBase()
            const nuevoAnchoBase = obtenerAnchoBase()
            const nuevoTamanoBloque = obtenerTamanoBloque(nuevoAlto)

            setAnchoJuego(nuevoAncho)
            setAltoJuego(nuevoAlto)
            setAltoBase(nuevoAltoBase)
            setAnchoBase(nuevoAnchoBase)

            setPosicionBase((anterior) =>
                Math.min(Math.max(anterior, 0), Math.max(nuevoAncho - nuevoAnchoBase, 0))
            )

            setExtraterrestres((anteriores) =>
                anteriores.map((bloque) => ({
                    ...bloque,
                    x: Math.min(Math.max(bloque.x, 0), Math.max(nuevoAncho - nuevoTamanoBloque, 0))
                }))
            )
        }

        actualizarDimensiones()
        window.addEventListener('resize', actualizarDimensiones)

        return () => {
            window.removeEventListener('resize', actualizarDimensiones)
        }
    }, []);

    useEffect(() => {
        const pasoBase = anchoJuego * PROPORCION_PASO_BASE

        const escucharTecla = (evento: KeyboardEvent) => {
            if (evento.key === 'ArrowLeft') {
                evento.preventDefault()
                setPosicionBase((anterior) => Math.max(anterior - pasoBase, 0))
                return
            }

            if (evento.key === 'ArrowRight') {
                evento.preventDefault()
                setPosicionBase((anterior) => Math.min(anterior + pasoBase, anchoJuego - anchoBase))
                return
            }

            if (evento.code === 'Space' && !evento.repeat) {
                evento.preventDefault()

                setDisparos((disparosAnteriores) => [
                    ...disparosAnteriores,
                    { x: posicionBase + anchoBase / 2 - tamanoDisparo / 2, y: altoBase }
                ])
            }
        }

        window.addEventListener('keydown', escucharTecla)

        return () => {
            window.removeEventListener('keydown', escucharTecla)
        }
    }, [anchoJuego, anchoBase, altoBase, tamanoDisparo, posicionBase])

    useEffect(() => {
        const pasoDisparo = obtenerTamanoBloque(altoJuego)
        const alturaMaximaDisparo = altoJuego - tamanoDisparo

        const identificadorIntervalo: number = setInterval(() => {
            setDisparos((disparosAnteriores) =>
                disparosAnteriores
                    .map((disparo) => ({ ...disparo, y: disparo.y + pasoDisparo }))
                    .filter((disparo) => disparo.y < alturaMaximaDisparo)
            )
        }, 1000)

        return () => {
            clearInterval(identificadorIntervalo)
        }
    }, [altoJuego, tamanoDisparo])

    useEffect(() => {
        const tamanoBloqueActual = obtenerTamanoBloque(altoJuego)
        const alturaMaximaAlien = altoJuego - altoBase - tamanoBloqueActual

        const identificadorIntervalo: number = setInterval(() => {
            setExtraterrestres((bloquesAnteriores) => {
                const bloquesActualizados = bloquesAnteriores.map((bloque) => {
                    const pasoHorizontal = (Math.floor(Math.random() * 3) - 1) * tamanoBloqueActual
                    const siguienteX = Math.min(Math.max(bloque.x + pasoHorizontal, 0), anchoJuego - tamanoBloqueActual)
                    const siguienteY = bloque.y + tamanoBloqueActual

                    return { x: siguienteX, y: siguienteY >= alturaMaximaAlien ? 0 : siguienteY }
                })

                return bloquesActualizados
            })
        }, 1000)

        return () => {
            clearInterval(identificadorIntervalo)
        }
    }, [altoJuego, altoBase, anchoJuego])

    useEffect(() => {
        if (disparos.length === 0) {
            return
        }

        const extraterrestresImpactados = new Set<number>()
        const disparosUsados = new Set<number>()

        extraterrestres.forEach((alien, indiceAlien) => {
            const alienYDesdeAbajo = altoJuego - alien.y - tamanoBloque

            disparos.forEach((disparo, indiceDisparo) => {
                if (disparosUsados.has(indiceDisparo)) {
                    return
                }

                const impacto =
                    Math.abs(alien.x - disparo.x) < tamanoBloque &&
                    Math.abs(alienYDesdeAbajo - disparo.y) < tamanoBloque

                if (impacto) {
                    extraterrestresImpactados.add(indiceAlien)
                    disparosUsados.add(indiceDisparo)
                }
            })
        })

        if (extraterrestresImpactados.size === 0) {
            return
        }

        setExtraterrestres((anteriores) =>
            anteriores.filter((_, indice) => !extraterrestresImpactados.has(indice))
        )

        setDisparos((disparosAnteriores) =>
            disparosAnteriores.filter((_, indice) => !disparosUsados.has(indice))
        )
    }, [disparos, extraterrestres, altoJuego, tamanoBloque])

    // si se elimina toda la oleada, nace una nueva despues de una pequeña pausa
    useEffect(() => {
        if (extraterrestres.length > 0) {
            return
        }

        const identificadorEspera = setTimeout(() => {
            setExtraterrestres(crearFilaDeExtraterrestres(anchoJuego, altoJuego))
        }, 1500)

        return () => {
            clearTimeout(identificadorEspera)
        }
    }, [extraterrestres.length, anchoJuego, altoJuego])

    return (
        <>
            <img src={naveImg} alt="Base" className="base-jugador" style={{ left: `${posicionBase}px` }} />
            {disparos.map((disparo, indice) => (
                <img key={indice} src={piedraImg} alt="Disparo" style={{
                    position: 'absolute',
                    width: `${tamanoDisparo}px`,
                    height: `${tamanoDisparo}px`,
                    left: `${disparo.x}px`,
                    bottom: `${disparo.y}px`,
                    objectFit: 'contain'
                }} />
            ))}
            {extraterrestres.map((bloque, indice) => (
                <img key={indice} src={alienImg} alt="Extraterrestre" style={{
                    position: 'absolute',
                    width: `${tamanoBloque}px`,
                    height: `${tamanoBloque}px`,
                    left: `${bloque.x}px`,
                    top: `${bloque.y}px`,
                    objectFit: 'contain'
                }} />
            ))}
        </>
    );
}

export default SpaceInvaders;
