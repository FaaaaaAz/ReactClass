export default function ejemploLlaves() {
    
    const mensaje: string = "Hola UPB";
    const sumar = (a: number, b: number): number => {
        return a + b;
    };
    const suma: number = sumar(3, 4);

    return (
        <section>
            <h1>{mensaje}</h1>
            <p>3 + 4 = {suma}</p>
        </section>
    )
}