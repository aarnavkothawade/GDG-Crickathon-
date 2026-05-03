import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  width: number;
  height: number;
  finishPercent?: number;
  onComplete?: () => void;
  children: React.ReactNode;
}

export default function ScratchCard({ 
  width, 
  height, 
  finishPercent = 50, 
  onComplete, 
  children 
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with grey overlay
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    // Add some noise/texture
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const alpha = Math.random() * 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Add text instructions
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL REWARD', width / 2, height / 2);

    ctx.globalCompositeOperation = 'destination-out';
  }, [width, height]);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    checkProgress();
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) {
        transparentPixels++;
      }
    }

    const percent = (transparentPixels / (width * height)) * 100;
    if (percent > finishPercent) {
      setIsScratched(true);
      onComplete?.();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = () => setIsDrawing(false);

  return (
    <div style={{ width, height, position: 'relative', borderRadius: '24px', overflow: 'hidden' }}>
      <div className="absolute inset-0 flex items-center justify-center bg-championship-gold/10">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 cursor-crosshair transition-opacity duration-500 ${isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
