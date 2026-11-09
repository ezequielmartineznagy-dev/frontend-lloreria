import React from 'react'

interface GotitaProps {
  size?: number
  className?: string
}

// El PNG es de 500x500 con margen transparente; se recorta a la caja de la gota.
const SRC_SIZE = 500
const CROP = { x: 112, y: 85, w: 273, h: 332 }

export const Gotita: React.FC<GotitaProps> = ({ size = 200, className = '' }) => {
  const width = size * 0.875
  const height = (width * CROP.h) / CROP.w

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{ width, height }}
      role="img"
      aria-label="Gotita desganada e indiferente, mascota de La Llorería"
    >
      <img
        src="/logo.png"
        alt=""
        draggable={false}
        className="absolute max-w-none"
        style={{
          width: `${(SRC_SIZE / CROP.w) * 100}%`,
          height: `${(SRC_SIZE / CROP.h) * 100}%`,
          left: `${(-CROP.x / CROP.w) * 100}%`,
          top: `${(-CROP.y / CROP.h) * 100}%`,
        }}
      />
    </div>
  )
}

export default Gotita
