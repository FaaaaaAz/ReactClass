export default function Reloj({ segundos }: { segundos: number }) {
  const total = Math.floor(segundos)
  const minutes = String(Math.floor(total / 60)).padStart(2, '0')
  const seconds = String(total % 60).padStart(2, '0')
  return <strong className="clock" aria-label={`${minutes} minutos, ${seconds} segundos`}>{minutes}:{seconds}</strong>
}
