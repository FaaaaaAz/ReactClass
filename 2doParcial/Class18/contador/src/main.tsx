import { createRoot } from 'react-dom/client'
import EjemploLlaves from './ejemploLlaves'
import Contador from './contador'

const contenedor = document.getElementById('root')!;

createRoot(contenedor).render(
  <>
    <EjemploLlaves />
    <Contador />
  </>
);