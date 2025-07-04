import React, { useRef, useEffect, useState } from "react";
import { Loader2, Undo2, Eraser, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** 45s drawable canvas, disabling submit prior to 10s. */
// PUBLIC_INTERFACE
export default function DrawingCanvas({ onFinish, disabled = false, prompt }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [timer, setTimer] = useState(45);
  const [canSubmit, setCanSubmit] = useState(false);
  const [reset, setReset] = useState(0);

  useEffect(() => {
    let id;
    if (!disabled && timer > 0) {
      id = setTimeout(() => setTimer(t => t - 1), 1000);
      if (timer <= 35) setCanSubmit(true); // at least 10s elapsed
    }
    return () => clearTimeout(id);
  }, [timer, disabled]);

  useEffect(() => {
    if (disabled) setTimer(45);
  }, [disabled]);

  const startDraw = (e) => {
    if (disabled) return;
    setDrawing(true);
    draw(e);
  };

  const endDraw = () => setDrawing(false);

  const draw = (e) => {
    if (!drawing || disabled || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.nativeEvent.offsetX || e.clientX - rect.left);
    const y = (e.touches ? e.touches[0].clientY : e.nativeEvent.offsetY || e.clientY - rect.top);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#6366f1";
    ctx.globalAlpha = 0.93;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const resetCanvas = () => {
    setReset(r => r + 1);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath();
  };

  const erase = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 14;
  };

  const submit = () => {
    if (!canSubmit || disabled || timer <= 0) return;
    // png base64 from canvas
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onFinish?.(dataUrl);
  };

  return (
    <motion.div layout className="w-full flex flex-col items-center">
      <AnimatePresence>
        {timer > 0 && (
          <motion.div
            className="mb-2 flex flex-col items-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160 }}
          >
            <div className="text-xs text-gray-400 mb-1 font-titleAlt">Timer</div>
            <span className="inline-block font-titleAlt text-3xl px-3 py-1 rounded-lg bg-highlight/90 text-white shadow"
              style={{ letterSpacing: "0.04em" }}>
              {timer}s
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas
        ref={canvasRef}
        className="w-full touch-none rounded-lg bg-gradient-to-tr from-background-gradient1 to-background-gradient2 shadow-lg cursor-crosshair"
        width={360}
        height={210}
        style={{ maxWidth: '95vw', maxHeight: '310px', border: "2px solid #e4f0ff" }}
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseOut={endDraw}
        onMouseMove={draw}
        onTouchStart={startDraw}
        onTouchEnd={endDraw}
        onTouchMove={draw}
      />
      <div className="flex gap-4 mt-2 items-center">
        <button title="Undo/Clear" className="btn btn-sm btn-outline btn-secondary rounded-full" onClick={resetCanvas}><Undo2 /></button>
        <button title="Eraser" className="btn btn-sm btn-outline btn-accent rounded-full" onClick={erase}><Eraser /></button>
        <motion.button
          className="btn btn-primary btn-sm font-titleAlt rounded-full"
          disabled={!canSubmit}
          whileTap={{ scale: 0.94 }}
          onClick={submit}
        >
          <Send className="mr-1" /> Submit!
        </motion.button>
      </div>
      <div className="text-xs text-slate-400 mt-1"> Please draw a <b>{prompt}</b>! </div>
      {!canSubmit && <div className="text-xs text-warning mt-1">Draw for at least 10s to enable submit.</div>}
      {timer <= 0 && (
        <motion.div
          className="alert alert-error mt-2"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <X className="mr-1" /> Time's up!
        </motion.div>
      )}
    </motion.div>
  );
}
