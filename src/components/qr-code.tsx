import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 140 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        color: { dark: '#7d421f', light: '#ffffff' },
        margin: 1,
      })
    }
  }, [value, size])

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />
}
