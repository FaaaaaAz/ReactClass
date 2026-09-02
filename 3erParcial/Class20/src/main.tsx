import { createRoot } from 'react-dom/client'
import Reloj from './Reloj';
import './styles.css';
import SpaceInvaders from './SpaceInvaders';

createRoot(document.getElementById('root')!).render(
  <div className='contenedor'>
    <Reloj />
    <SpaceInvaders />
  </div>
)