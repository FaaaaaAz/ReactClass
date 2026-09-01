import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: la aplicacion no se publica en la raiz del dominio, sino dentro del
// repositorio: https://faaaaaaz.github.io/ReactClass/
// Sin esta linea GitHub Pages no encuentra los archivos de dist y la pagina
// aparece en blanco.
export default defineConfig({
  plugins: [react()],
  base: '/ReactClass/',
})
