import { useEffect, useState } from "react";

async function fetchSaludo(): Promise<string> {
const response = await fetch("/saludo");
return response.text();
}

function Saludo() {
const [saludo, setSaludo] = useState("!!!");

useEffect(() => {
    fetchSaludo().then((texto) => setSaludo(texto));
}, []);

return <p>{saludo}</p>;
}

export default Saludo;
