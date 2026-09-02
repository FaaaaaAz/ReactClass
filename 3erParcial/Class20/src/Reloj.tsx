import { useState, useEffect } from "react";

function Reloj() {
    const [segundosTranscurridos, setSegundosTranscurridos] = useState<number>(0)

    useEffect(() => {
        const identificadorIntervalo: number = setInterval(() => {
            setSegundosTranscurridos((segundosAnteriores) => {
                return segundosAnteriores + 1;
            })
        }, 1000)

        return () => {
            clearInterval(identificadorIntervalo)
        }
    }, [])

    return (
        <>
            Segundos: {segundosTranscurridos}
        </>
    );
}

export default Reloj;
