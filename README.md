# ReactClass

Repositorio académico de la materia de **React** de la Universidad Privada Boliviana (UPB).

Aquí se reúne el trabajo realizado durante el semestre: ejemplos vistos en clase, ejercicios prácticos y proyectos que muestran el avance desde los fundamentos del desarrollo web hasta la creación de aplicaciones interactivas con React y TypeScript.

## Contenido

### Primer parcial: fundamentos de desarrollo web

La carpeta `1erParcial` contiene prácticas introductorias de:

- Estructura y etiquetas semánticas de HTML.
- Enlaces, imágenes, listas y tablas.
- Formularios y distintos tipos de controles.
- Selectores, clases e identificadores.
- Estilos con CSS.
- Modelo de caja, visualización y posicionamiento.
- Flexbox y diseño adaptable.
- Pseudoclases e interacciones sencillas.
- Ejercicios como Buscaminas, Juego de Memoria y Carrera de Emojis.

### Segundo parcial: JavaScript, TypeScript y React

La carpeta `2doParcial` documenta la transición hacia el desarrollo de aplicaciones dinámicas:

- Fundamentos de JavaScript.
- Manipulación del DOM con `querySelector`.
- Tipado estático con TypeScript.
- Componentes y JSX/TSX.
- Eventos en React.
- Estado de componentes con `useState`.
- Renderizado de listas mediante `map`.
- Proyectos creados con React, TypeScript y Vite.
- Ejercicios como Contador, Tres en Raya y Buscaminas.

### Examen parcial: juego de la Serpiente

En `2doParcial/ExamenParcial/Serpiente` se encuentra un juego completo desarrollado con React y TypeScript. Incluye:

- Tablero de 8 × 8.
- Movimiento mediante las flechas del teclado.
- Crecimiento de la serpiente al comer.
- Detección de colisiones con los bordes y el cuerpo.
- Generación de comida en posiciones libres.
- Estados de juego: jugando, ganado y perdido.
- Componentes separados para el tablero, las celdas y los mensajes.
- Opción para reiniciar la partida.

El proyecto se valida automáticamente con ESLint y TypeScript, y se publica mediante GitHub Actions.

**Demo:** [Juego de la Serpiente](https://faaaaaaz.github.io/ReactClass/)

## Estructura principal

```text
ReactClass/
├── 1erParcial/                 # HTML y CSS
├── 2doParcial/
│   ├── Class12–Class16/        # JavaScript, TypeScript y DOM
│   ├── Class17–Class19/        # Introducción a React
│   └── ExamenParcial/
│       └── Serpiente/          # Proyecto React + TypeScript
├── .github/workflows/          # Validación y despliegue automático
├── eslint.config.mjs
└── package.json
```

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- TypeScript
- React
- Vite
- ESLint
- GitHub Actions
- GitHub Pages

## Cómo ejecutar los ejercicios

Los ejercicios de HTML y CSS pueden abrirse directamente desde su archivo `index.html` o mediante una extensión como **Live Server** en Visual Studio Code.

Para ejecutar uno de los proyectos de React:

```bash
cd 2doParcial/ExamenParcial/Serpiente
npm install
npm run dev
```

Luego se debe abrir en el navegador la dirección local mostrada por Vite.

Para comprobar la calidad y compilación del proyecto:

```bash
npm run lint
npm run build
```

## Propósito

Este repositorio funciona como una bitácora práctica del aprendizaje de la materia. Su contenido continuará creciendo a medida que se incorporen nuevos temas, ejercicios y proyectos durante el semestre.

## Autor

**Fabian Azeñas**  
Estudiante de Ingeniería de Sistemas Computacionales — UPB
