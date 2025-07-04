import React, { useRef, useEffect, useState } from "react";
import { Loader2, Undo2, Eraser, Send, X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 45s drawable canvas, disabling submit prior to 10s.
 * Integrates clean toggling between pencil and eraser modes, allowing smooth transition and proper stroke/eraser handling.
 */
// PUBLIC_INTERFACE
export default function DrawingCanvas({ onFinish, disabled = false, prompt }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [timer, setTimer] = useState(45);
  const [canSubmit, setCanSubmit] = useState(false);
  const [reset, setReset] = useState(0);
  const [tool, setTool] = useState("pen"); // "pen" or "eraser"
  const [lastPoint, setLastPoint] = useState(null);

  // Tool Styles
  const PEN = {
    strokeStyle: "#6366f1",
    lineWidth: 5,
    globalAlpha: 0.93,
    lineCap: "round",
  };
  const ERASER = {
    strokeStyle: "#fff",
    lineWidth: 18,
    globalAlpha: 1,
    lineCap: "round",
  };

  useEffect(() => {
    let id;
    if (!disabled && timer > 0) {
      id = setTimeout(() => setTimer((t) => t - 1), 1000);
      if (timer <= 35) setCanSubmit(true); // at least 10s elapsed
    }
    return () => clearTimeout(id);
  }, [timer, disabled]);

  useEffect(() => {
    if (disabled) setTimer(45);
  }, [disabled]);

  // Utility to get [x, y] coordinates
  const getPointer = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return [
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top,
      ];
    }
    // Mouse event
    return [
      e.nativeEvent?.offsetX !== undefined
        ? e.nativeEvent.offsetX
        : e.clientX - rect.left,
      e.nativeEvent?.offsetY !== undefined
        ? e.nativeEvent.offsetY
        : e.clientY - rect.top,
    ];
  };

  // Set drawing attributes on the context
  const applyToolStyle = (ctx, currentTool = tool) => {
    if (currentTool === "pen") {
      ctx.strokeStyle = PEN.strokeStyle;
      ctx.lineWidth = PEN.lineWidth;
      ctx.globalAlpha = PEN.globalAlpha;
      ctx.lineCap = PEN.lineCap;
    } else {
      ctx.strokeStyle = ERASER.strokeStyle;
      ctx.lineWidth = ERASER.lineWidth;
      ctx.globalAlpha = ERASER.globalAlpha;
      ctx.lineCap = ERASER.lineCap;
    }
  };

  // Drawing state handling (mouse/touch)
  const startDraw = (e) => {
    if (disabled) return;
    setDrawing(true);
    const [x, y] = getPointer(e);
    setLastPoint([x, y]);
    const ctx = canvasRef.current.getContext("2d");
    applyToolStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
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

  // Clear/Undo (full reset)
  const resetCanvas = () => {
    setReset((r) => r + 1);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath();
  };

  // Toggle between pen and eraser
  const toggleTool = () => {
    setTool((t) => (t === "pen" ? "eraser" : "pen"));
  };

  // Keyboard shortcut for eraser (optional)
  useEffect(() => {
    const handler = (e) => {
      if (disabled) return;
      if (e.key === "e") setTool("eraser");
      if (e.key === "p") setTool("pen");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [disabled]);

  const submit = () => {
    if (!canSubmit || disabled || timer <= 0) return;
    // png base64 from canvas
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onFinish?.(dataUrl);
  };

  // Icon for current tool
  const toolIcon = tool === "pen" ? <Pencil /> : <Eraser />;

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
            <span
              className="inline-block font-titleAlt text-3xl px-3 py-1 rounded-lg bg-highlight/90 text-white shadow"
              style={{ letterSpacing: "0.04em" }}
            >
              {timer}s
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas
        ref={canvasRef}
        className={`w-full touch-none rounded-lg bg-gradient-to-tr from-background-gradient1 to-background-gradient2 shadow-lg ${
          tool === "pen" ? "cursor-crosshair" : "cursor-pointer"
        }`}
        width={360}
        height={210}
        style={{
          maxWidth: "95vw",
          maxHeight: "310px",
          border: "2px solid #e4f0ff",
        }}
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseOut={endDraw}
        onMouseMove={draw}
        onTouchStart={startDraw}
        onTouchEnd={endDraw}
        onTouchMove={draw}
      />
      <div className="flex gap-4 mt-2 items-center">
        <button
          title="Undo/Clear"
          className="btn btn-sm btn-outline btn-secondary rounded-full"
          onClick={resetCanvas}
        >
          <Undo2 />
        </button>
        <button
          title={tool === "pen" ? "Switch to Eraser (E)" : "Switch to Pencil (P)"}
          className={`btn btn-sm btn-outline ${
            tool === "eraser" ? "btn-accent" : ""
          } rounded-full`}
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
      </div>
      <div className="text-xs text-slate-400 mt-1">
        Please draw a <b>{prompt}</b>!{" "}
        <span className="ml-2 text-gray-500">
          {tool === "pen"
            ? "(Pencil: click or tap to draw)"
            : "(Eraser: click or tap to erase)"}
        </span>
      </div>
      {!canSubmit && (
        <div className="text-xs text-warning mt-1">
          Draw for at least 10s to enable submit.
        </div>
      )}
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
