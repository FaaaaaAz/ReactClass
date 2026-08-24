let casillas = document.querySelectorAll(".tablero td");
let contenidos = [];
let perdiste = false;

casillas.forEach(function (casilla, i) {

    contenidos[i] = casilla.textContent;
    casilla.textContent = "";

    casilla.addEventListener("click", function () {

        if (perdiste) {
            return;
        }

        if (contenidos[i] == "💣") {

            perdiste = true;

            casillas.forEach(function (otra) {
                otra.textContent = "❌";
            });

            casilla.textContent = "💣";

        } else {

            casilla.textContent = "😊";

        }

    });

});
