import React, { useRef, useEffect, useState } from "react";
import { socket } from "@/socket";
import { Button } from "@/components/ui/button";

type Props = {
    roomCode: string;
    isDrawingAllowed: boolean;
};

export const Canvas = ({ roomCode, isDrawingAllowed }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      ctxRef.current = canvas.getContext("2d");
    }

    socket.on("draw-data", ({ x, y }: { x: number; y: number }) => {
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });

    socket.on("beginPath", ({ x, y }: { x: number; y: number }) => {
        const ctx = ctxRef.current;
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        }
      });

    socket.on("resetCanvas", () => {
        const ctx = ctxRef.current;
        if (ctx) {
          ctx.clearRect(0, 0, 800, 600);
        }
        });

    return () => {
      socket.off("beginPath");
      socket.off("draw-data");
    };
  }, [roomCode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingAllowed) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);

    socket.emit("beginPath", { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, roomCode: roomCode });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingAllowed) return;
    const ctx = ctxRef.current;
    if (!ctx || !isDrawing) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();

    socket.emit("draw", {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      roomCode: roomCode
    });
  };

  const handleMouseUp = () => {
    if (!isDrawingAllowed) return;
    setIsDrawing(false);
  };

  const handleReset = () => {
    if (!isDrawingAllowed) return;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, 800, 600);
    }
    socket.emit("resetCanvas", roomCode);
  }

return (
    <div style={{ position: "relative" }}>
        <canvas
            id="drawingCanvas"
            className="border border-gray-300 rounded-md"
            width={800}
            height={600}
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
        <Button 
            onClick={handleReset} 
            style={{ position: "absolute", top: 10, right: 10 }}
        >
            reset canvas
        </Button>
    </div>
);
};
