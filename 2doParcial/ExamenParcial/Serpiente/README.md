# 🐍 Serpiente — Examen Parcial (React + TypeScript)

Juego de la serpiente construido con **Vite + React + TypeScript**. El tablero es
una tabla HTML de 8 filas por 8 columnas y la serpiente se controla con las
flechas del teclado: **cada pulsación es un turno**.

- **Aplicación publicada:** https://faaaaaaz.github.io/ReactClass/
- **Repositorio:** https://github.com/FaaaaaAz/ReactClass
- **Código fuente:** `2doParcial/ExamenParcial/Serpiente`

---

## 1. Instalar y ejecutar

Desde esta carpeta (`2doParcial/ExamenParcial/Serpiente`):

```bash
npm install     # instala las dependencias
npm run dev     # levanta el servidor de desarrollo
```

Vite muestra en la terminal la dirección local (por ejemplo
`http://localhost:5173`). Al abrirla en el navegador se puede jugar.

Otros comandos disponibles:

```bash
npm run build     # revisa los tipos con tsc y construye dist/
npm run preview   # sirve la versión construida
npm run lint      # revisa el código con ESLint
```

## 2. Cómo se juega

1. Hacer **clic sobre el tablero** para que reciba el foco del teclado (el
   tablero se resalta cuando lo tiene).
2. Usar las flechas `↑` `↓` `←` `→`. Cada pulsación mueve la cabeza **una sola
   celda**; el juego no avanza solo.
3. Retroceder en dirección contraria hace que la cabeza entre en su propio
   cuerpo, así que cuenta como choque y termina la partida.
4. El botón **Reiniciar** vuelve al estado inicial.

## 3. Reglas implementadas

| Regla | Dónde está resuelta |
| --- | --- |
| Tablero de 8 filas y 8 columnas | `indices` en `src/juego.ts`, recorrido con `map` en `src/Tablero.tsx` |
| La serpiente empieza con 3 segmentos | `serpienteInicial` en `src/juego.ts` |
| La cabeza se distingue del cuerpo | Es el primer elemento de la lista; se pinta con `.celda-cabeza` (verde oscuro) y el emoji 🐍 |
| Cada flecha es un turno | `manejarTecla` llama a `mover` una vez por pulsación |
| La cabeza avanza una celda | `mover(avanceFila, avanceColumna)` suma ±1 a la posición de la cabeza |
| El cuerpo sigue a la cabeza y pierde el último segmento si no come | `serpiente.slice(0, serpiente.length - 1)` |
| La comida aparece en una celda libre | `generarComida` arma la lista de celdas libres y elige una al azar |
| La serpiente crece al comer | Cuando come, el cuerpo **no** se recorta, así que la lista queda con un segmento más |
| El juego termina al salir del tablero o al chocar consigo misma | `estaFueraDelTablero` y `estaOcupada` |
| Señal visual al terminar | El borde externo de la tabla se vuelve **rojo** (`.tablero-choque`) y aparece un mensaje |
| El tablero se vuelve a renderizar cada turno | Cada turno crea listas nuevas y se guardan con las funciones `set...` de `useState` |

## 4. Estructura del código

| Archivo | Responsabilidad |
| --- | --- |
| `src/main.tsx` | Monta el componente `Serpiente` en el elemento `root`. |
| `src/Serpiente.tsx` | Componente principal: guarda el estado con `useState`, resuelve el turno y escucha el teclado. |
| `src/Tablero.tsx` | Dibuja la tabla de 8×8 con `map` sobre filas y columnas. |
| `src/Celda.tsx` | Dibuja una celda (`td`) según su contenido. |
| `src/Mensaje.tsx` | Muestra un mensaje distinto según el resultado de la partida. |
| `src/juego.ts` | Tipos, datos iniciales y funciones del juego. No contiene JSX. |
| `src/style.css` | Estilos del tablero, la cabeza, el cuerpo, la comida y el mensaje. |

El flujo de datos va en una sola dirección: `Serpiente` guarda el estado y lo
entrega hacia abajo como props; los componentes hijos solamente dibujan.

```
Serpiente  (useState: serpiente, comida, resultado)
   |-- Tablero  (props: serpiente, comida, perdido)
   |      |-- Celda  (props: contenido)
   |-- Mensaje  (props: resultado, comidas)
```

## 5. El estado y el turno, paso a paso

El estado se guarda con tres `useState`:

```tsx
const [serpiente, setSerpiente] = useState<Posicion[]>(serpienteInicial);
const [comida, setComida] = useState<Posicion>(comidaInicial);
const [resultado, setResultado] = useState<Resultado>('jugando');
```

La serpiente es una lista de posiciones donde **el primer elemento es la
cabeza**. 

## 6. Calidad del código


- **Tipado explícito.** `Posicion` describe una celda, y dos tipos de unión
  describen los estados posibles: `Contenido` (cabeza, cuerpo, comida o vacía) y
  `Resultado` (jugando, perdido o ganado). Así el compilador detecta un valor mal
  escrito antes de ejecutar la aplicación.
- **Lógica separada de la interfaz.** `src/juego.ts` no contiene JSX: son
  funciones que reciben datos y devuelven datos. Se pueden leer sin abrir el
  navegador, y los componentes quedan cortos.
- **Componentes pequeños con una sola responsabilidad.** `Celda` solo pinta una
  celda, `Tablero` solo arma la tabla, `Mensaje` solo elige el texto y
  `Serpiente` es el único que guarda estado.
- **Props tipadas con `interface`.** Cada componente declara qué recibe
  (`CeldaProps`, `TableroProps`, `MensajeProps`), así que no se puede usar mal.
- **Estado inmutable.** Nunca se modifica la lista de segmentos con `push` ni se
  reasigna una posición: cada turno crea listas nuevas con `slice` y `concat`.
  Esa es la forma en que React reconoce el cambio y vuelve a renderizar.
- **Sin datos duplicados en el estado.** El número de comidas no se guarda: se
  calcula con `serpiente.length - serpienteInicial.length`, así no puede quedar
  desincronizado.
- **Claves estables en las listas.** Las filas usan `key={fila}` y las celdas
  `key={fila + '-' + columna}`: valores únicos entre hermanos, que no cambian
  entre renders y que no se generan al azar.
- **Nombres en español y consistentes** con el resto del curso: `serpiente`,
  `comida`, `mover`, `manejarTecla`, `generarComida`.
- **Revisión automática.** ESLint (`npm run lint`) y la compilación de TypeScript
  (`tsc -b`, incluida en `npm run build`) se ejecutan en cada push mediante el
  workflow `Validar Serpiente`.
- **Solo herramientas vistas en clase.** El proyecto usa únicamente `useState`,
  props, `map`, `key`, renderizado condicional, eventos de teclado y CSS. No se
  instaló ninguna librería externa.

## 7. Publicación con GitHub Actions y GitHub Pages

Los archivos de configuración están en `.github/workflows/`, en la raíz del
repositorio:

| Workflow | Qué hace |
| --- | --- |
| `publicarSerpiente.yml` | En cada push a `main` instala dependencias, construye con Vite y publica `dist/` en GitHub Pages. |
| `validarSerpiente.yml` | En cada push revisa el código con ESLint y compila TypeScript. |


