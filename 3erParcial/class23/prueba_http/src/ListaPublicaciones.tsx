import { useEffect, useState } from "react";

type Publicacion = {
userId: number;
id: number;
title: string;
body: string;
};

const API_URL = "https://jsonplaceholder.typicode.com";

async function fetchPublicaciones(): Promise<Publicacion[]> {
const response = await fetch(`${API_URL}/posts`);
const data = await response.json();
return data;
}

function ListaPublicaciones() {
const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

useEffect(() => {
    fetchPublicaciones().then((datos) => setPublicaciones(datos));
}, []);

return (
    <ul>
    {publicaciones.map((post) => {
        return <li key={post.id}>{post.title}</li>;
    })}
    </ul>
);
}

export default ListaPublicaciones;