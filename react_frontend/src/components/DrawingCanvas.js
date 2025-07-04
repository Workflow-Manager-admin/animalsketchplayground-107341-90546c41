import React, { useRef, useEffect, useState } from "react";
import { Loader2, Undo2, Eraser, Send, X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * DrawingCanvas provides a full-bleed, modern pastel-style canvas.
 * 45s timer, disables submit for first 10s, responsive layout, playful icon controls below.
 * Large tap targets, soft focus, pastel backgrounds.
 */
// PUBLIC_INTERFACE
export default function DrawingCanvas({ onFinish, disabled = false, prompt, height }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [timer, setTimer] = useState(45);
  const [canSubmit, setCanSubmit] = useState(false);
  const [reset, setReset] = useState(0);
  const [tool, setTool] = useState("pen");
  const [lastPoint, setLastPoint] = useState(null);

  // Styles for pen/eraser, pastel/soft accent
  const PEN = {
    strokeStyle: "#6366f1", // indigo
    lineWidth: 5,
    globalAlpha: 0.93,
    lineCap: "round"
  };
  const ERASER = {
    strokeStyle: "#fff",
    lineWidth: 18,
    globalAlpha: 1,
    lineCap: "round"
  };

  useEffect(() => {
    let id;
    if (!disabled && timer > 0) {
      id = setTimeout(() => setTimer(t => t - 1), 1000);
      if (timer <= 35) setCanSubmit(true);
    }
    return () => clearTimeout(id);
  }, [timer, disabled]);

  useEffect(() => { if (disabled) setTimer(45); }, [disabled]);

  // Drawing logic (touch + mouse)
  const getPointer = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches)
      return [
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top
      ];
    return [
      e.nativeEvent?.offsetX !== undefined
        ? e.nativeEvent.offsetX
        : e.clientX - rect.left,
      e.nativeEvent?.offsetY !== undefined
        ? e.nativeEvent.offsetY
        : e.clientY - rect.top
    ];
  };
  const applyToolStyle = (ctx, currentTool = tool) => {
    if (currentTool === "pen") {
      Object.assign(ctx, PEN);
    } else {
      Object.assign(ctx, ERASER);
    }
  };
  const startDraw = e => {
    if (disabled) return;
    setDrawing(true);
    const [x, y] = getPointer(e);
    setLastPoint([x, y]);
    const ctx = canvasRef.current.getContext("2d");
    applyToolStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const draw = e => {
    if (!drawing || disabled || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    applyToolStyle(ctx);
    const [x, y] = getPointer(e);
    if (lastPoint) {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      setLastPoint([x, y]);
    }
  };
  const endDraw = () => {
    setDrawing(false);
    setLastPoint(null);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };
  // Controls
  const resetCanvas = () => {
    setReset(r => r + 1);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath();
  };
  const toggleTool = () => setTool(t => (t === "pen" ? "eraser" : "pen"));
  useEffect(() => {
    const handler = e => {
      if (disabled) return;
      if (e.key === "e") setTool("eraser");
      if (e.key === "p") setTool("pen");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [disabled]);
  const submit = () => {
    if (!canSubmit || disabled || timer <= 0) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onFinish?.(dataUrl);
  };

  const toolIcon = tool === "pen" ? <Pencil /> : <Eraser />;
  let cssCanvasHeight = height
    ? height
    : window.innerHeight
    ? Math.max(window.innerHeight * 0.54, 340)
    : 380;
  if (typeof cssCanvasHeight === "number") cssCanvasHeight = cssCanvasHeight + "px";

  return (
    <motion.div
      layout
      className="w-full flex flex-col items-center justify-start px-0"
      style={{ flex: "1 1 0%", minHeight: "0px" }}
    >
      <div className="flex w-full justify-center fade-in-up" style={{ minHeight: 0 }}>
        <AnimatePresence>
          {timer > 0 && (
            <motion.div
              className="mb-2 flex flex-col items-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160 }}
            >
              <div className="text-xs text-gray-400 mb-1 font-titleAlt">Timer</div>
              <span
                className="inline-block font-titleAlt text-3xl px-3 py-1 rounded-lg bg-highlight/90 text-white shadow"
                style={{ letterSpacing: "0.04em" }}
              >
                {timer}s
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          flexGrow: 1,
          minHeight: "min(260px,36vh)",
          maxHeight: "65vh",
        }}
      >
        <canvas
          ref={canvasRef}
          className={`w-full touch-none rounded-xl bg-gradient-to-tr from-background-gradient1 to-background-gradient2 shadow-xl ${
            tool === "pen" ? "cursor-crosshair" : "cursor-pointer"
          }`}
          width={480}
          height={parseInt(cssCanvasHeight) || 400}
          style={{
            width: "100%",
            height: cssCanvasHeight,
            minHeight: "210px",
            maxHeight: "440px",
            maxWidth: "98vw",
            border: "2px solid #e4f0ff",
            objectFit: "contain",
            display: "block",
            boxSizing: "border-box",
            touchAction: "none",
            background: "linear-gradient(135deg,var(--background-gradient1),var(--background-gradient2))"
          }}
          onMouseDown={startDraw}
          onMouseUp={endDraw}
          onMouseOut={endDraw}
          onMouseMove={draw}
          onTouchStart={startDraw}
          onTouchEnd={endDraw}
          onTouchMove={draw}
        />
      </div>
      {/* Controls, playful microanimation + icons */}
      <div className="flex flex-row flex-wrap gap-2 mt-2 items-center justify-center w-full" style={{ paddingBottom: 2, marginTop: 10 }}>
        <button
          title="Undo/Clear"
          className="btn btn-sm btn-outline btn-secondary rounded-full"
          onClick={resetCanvas}
        >
          <Undo2 />
        </button>
        <button
          title={tool === "pen" ? "Switch to Eraser (E)" : "Switch to Pencil (P)"}
          className={`btn btn-sm btn-outline ${tool === "eraser" ? "btn-accent" : ""} rounded-full`}
          onClick={toggleTool}
        >
          {toolIcon}
        </button>
        <motion.button
          className="btn btn-primary btn-sm font-titleAlt rounded-full"
          disabled={!canSubmit}
          whileTap={{ scale: 0.94 }}
          onClick={submit}
        >
          <Send className="mr-1" /> Submit!
        </motion.button>
        <span className="ml-3 text-xs text-slate-400 inline-block">
          <b>{prompt}</b>
        </span>
      </div>
      <div className="text-xs text-slate-400 w-full text-center mt-2">
        <span>
          {tool === "pen"
            ? "✏️ Draw (touch or mouse)"
            : "🧽 Erase (touch or mouse)"}
        </span>
        {!canSubmit && (
          <span className="ml-2 text-warning">
            Draw for at least 10s to enable submit.
          </span>
        )}
      </div>
      {timer <= 0 && (
        <motion.div
          className="alert alert-error mt-2 text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <X className="mr-1" /> Time's up!
        </motion.div>
      )}
    </motion.div>
  );
}
