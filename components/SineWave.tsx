"use client";

import React, { useEffect, useMemo, useRef } from "react";

interface WaveConfig {
  timeModifier: number;
  lineWidth: number;
  amplitude: number;
  wavelength: number;
}

interface SineWaveProps {
  isSpeaking: boolean;
  type: "user" | "ai" | "connecting";
}

export const SineWave: React.FC<SineWaveProps> = ({ isSpeaking, type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const smoothAmplitudeRef = useRef(0);

  const waves: WaveConfig[] = useMemo(
    () => [
      { timeModifier: 1.2, lineWidth: 2, amplitude: 60, wavelength: 50 },
      { timeModifier: 0.9, lineWidth: 1.5, amplitude: 40, wavelength: 60 },
      { timeModifier: 1.5, lineWidth: 1, amplitude: 25, wavelength: 80 },
    ],
    []
  );

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Resize canvas if needed
      if (
        canvas.width !== canvas.offsetWidth ||
        canvas.height !== canvas.offsetHeight
      ) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth amplitude transition (Siri-like breathing)
      // For connecting, we want a constant slight breathing even if not speaking
      const targetAmplitude =
        isSpeaking || type === "connecting"
          ? type === "connecting"
            ? 0.6
            : 1
          : 0;
      smoothAmplitudeRef.current +=
        (targetAmplitude - smoothAmplitudeRef.current) * 0.08;

      // Time progression
      timeRef.current += 0.015 + smoothAmplitudeRef.current * 0.05;

      // Gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

      if (type === "ai" || type === "connecting") {
        gradient.addColorStop(0, "rgba(120, 0, 255, 0)");
        gradient.addColorStop(0.5, "rgba(232, 3, 57, 0.85)");
        gradient.addColorStop(1, "rgba(0, 200, 255, 0)");
      } else {
        gradient.addColorStop(0, "rgba(0, 200, 120, 0)");
        gradient.addColorStop(0.5, "rgba(0, 220, 255, 0.85)");
        gradient.addColorStop(1, "rgba(0, 120, 255, 0)");
      }

      ctx.shadowBlur = 20;
      if (type === "ai" || type === "connecting") {
        ctx.shadowColor = "rgba(232, 3, 57, 0.6)";
      } else {
        ctx.shadowColor = "rgba(0, 220, 255, 0.6)";
      }

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.lineWidth = wave.lineWidth;
        ctx.strokeStyle = gradient;

        for (let x = 0; x < canvas.width; x++) {
          const progress = x / canvas.width;

          // Center-weighted falloff (Siri magic ✨)
          const edgeFade = Math.sin(Math.PI * progress);

          // Organic noise
          const noise = Math.sin(timeRef.current * 2 + x * 0.02 + index) * 3;

          const y =
            canvas.height / 2 +
            Math.sin(
              x / wave.wavelength + timeRef.current * wave.timeModifier
            ) *
              wave.amplitude *
              smoothAmplitudeRef.current *
              edgeFade +
            noise * smoothAmplitudeRef.current;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, type, waves]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-0"
    />
  );
};

export default SineWave;
