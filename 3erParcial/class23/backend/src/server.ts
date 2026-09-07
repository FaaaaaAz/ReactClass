import express from "express";

const app = express();
const puerto = 3000;

app.get("/saludo", (req, res) => {
res.send("Hola desde express");
});

app.listen(puerto, () => {
console.log("servidor iniciado");
});