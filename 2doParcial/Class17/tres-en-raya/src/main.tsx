import { createRoot } from 'react-dom/client';
import TresEnRaya from './tresEnRaya';
import './style.css';

const contenedor = document.querySelector('#root');

const root = createRoot(contenedor!);

root.render(<TresEnRaya />);