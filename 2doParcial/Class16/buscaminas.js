let listaElementos = document.querySelectorAll("td");
for (const elemento of listaElementos) {
    elemento.addEventListener('click', function () {
        console.log(elemento.textContent);
        console.log(elemento.classList.value);

        if (elemento.classList.contains("mina")) {
            for (const item of listaElementos) {
                item.textContent = "💥";
                item.style.color = "gray";
            }
        } else {
            elemento.style.color = "gray";
        }

    });
}