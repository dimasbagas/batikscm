import { useEffect, useRef } from 'react'
import * as QRCodeLib from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 140 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Handle both ESM and CJS bundling styles dynamically
      const qr = (QRCodeLib as any).toCanvas ? QRCodeLib : ((QRCodeLib as any).default || QRCodeLib);
      if (qr && typeof qr.toCanvas === 'function') {
        qr.toCanvas(canvasRef.current, value, {
          width: size,
          color: { dark: '#7d421f', light: '#ffffff' },
          margin: 1,
        }).catch((err: any) => {
          console.error('Failed to render QR Code on canvas:', err);
        });
      } else {
        console.error('qrcode library toCanvas method not found. Import object:', QRCodeLib);
      }
    }
  }, [value, size])

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />
}
