console.log("Esto es un Buscaminas.");

let tabla = document.querySelector<HTMLTableElement>("table");

if(tabla) {
    console.log(tabla.tagName);
    console.log(tabla.className);
}

let celda = document.querySelector("td");

if(celda) {
    console.log(celda.textContent);
} else {
    console.log("No existe");
}

