import React, { useState } from "react";
import PromptSpin from "../components/PromptSpin";
import DrawingCanvas from "../components/DrawingCanvas";
import { db, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertTriangle, XCircle } from "lucide-react";

/**
 * Drawing page — lets user spin prompt, draw, and submit to Firebase.
 * Handles error, required field state, and improves feedback for upload and process status.
 */
// PUBLIC_INTERFACE
export default function Drawing({ user, onBack }) {
  const [prompt, setPrompt] = useState("");
  const [drawingUrl, setDrawingUrl] = useState(""); // base64 before upload
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Called by PromptSpin
  const handlePrompt = (p) => {
    setPrompt(p);
    // reset prior submission UI
    setError("");
    setDrawingUrl("");
    setSuccess(false);
    setSubmitted(false);
  };

  // Set by DrawingCanvas after drawing is finished (user hits Submit)
  const handleFinishDrawing = async (dataUrl) => {
    if (!prompt) {
      setError("Spin for an animal prompt before submitting!");
      return;
    }
    if (!dataUrl) {
      setError("Drawing required before submitting!");
      return;
    }
    setDrawingUrl(dataUrl);
    setUploading(true);
    setError("");
    setSubmitted(true);

    try {
      // Store image in Firebase Storage
      const filename = `drawings/${Date.now()}_${Math.floor(Math.random()*100000)}.png`;
      const storageRef = ref(storage, filename);
      await uploadString(storageRef, dataUrl, "data_url");
      const imageUrl = await getDownloadURL(storageRef);

      // Defensive: check user (should be present, but handle null)
      const userId = user && user.uid ? user.uid : "anonymous";
      const username = user && user.displayName ? user.displayName : "Unknown";

      // Add document to Firestore
      await addDoc(collection(db, "drawings"), {
        user: userId,
        username: username,
        prompt,
        animal: prompt, // prompt is the animal e.g. "monkey"
        imageUrl,
        guessesCount: 0,
        createdAt: Date.now(),
      });
      setSuccess(true);
    } catch (err) {
      let msg = "Failed to upload drawing. Please check your connection and try again.";
      if (err && err.message) {
        msg += " (" + err.message + ")";
      }
      setError(msg);
      // Log error in browser console for developer troubleshooting
      // eslint-disable-next-line no-console
      console.error("Drawing upload/save error:", err);
    }
    setUploading(false);
  };

  // If submitted and successful
  if (success)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2 fade-in-pop">
        <motion.div
          initial={{ scale: 0.2, rotate: -40, opacity: 0.4 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          className="rounded-full p-8 mb-2 bg-success/90 text-white drop-shadow-2xl mascot-img"
        >
          <ArrowLeft className="w-12 h-12 rotate-45" />
        </motion.div>
        <div className="text-3xl font-titleAlt text-success mb-3">Drawing posted!</div>
        <button className="prominent-action" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    );

  // Error alert component
  function ErrorBanner({ message, showRetry, onRetry }) {
    if (!message) return null;
    return (
      <motion.div
        className="alert alert-error rounded-lg my-2 flex gap-2 items-center text-base"
        initial={{ scale: 0.8, y: -10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 0, opacity: 0 }}
        role="alert"
      >
        <XCircle className="w-5 h-5" /> <span>{message}</span>
        {showRetry && (
          <button
            className="ml-3 btn btn-sm btn-accent font-titleAlt rounded-full px-3"
            onClick={onRetry}
            disabled={uploading}
            style={{ marginLeft: 16 }}
            aria-label="Retry Saving Drawing"
          >
            Retry
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#e4f0ff] to-[#f6fff9] px-3 py-7 relative">
      <button
        onClick={onBack}
        className="btn btn-link absolute top-4 left-4 btn-sm text-primary font-titleAlt"
        disabled={uploading}
        tabIndex={uploading ? -1 : 0}
      >
        <ArrowLeft /> Back
      </button>
      <motion.h1 className="font-titleAlt text-3xl md:text-4xl text-primary mb-3 flex gap-2 fade-in-pop" layout>
        <span className="text-accent-pink">🎨</span> Add a Drawing!
      </motion.h1>
      <PromptSpin onPrompt={handlePrompt} />
      {/* Show error banner below spinner if error related to prompt/flow.
          Show Retry button only if an upload was submitted and failed (not prompt-missing error). */}
      <ErrorBanner
        message={error}
        showRetry={!!error && submitted && !uploading}
        onRetry={() => {
          setError("");
          setSuccess(false);
          setUploading(false);
          // User can resubmit; DrawingCanvas will call handleFinishDrawing on 'Submit!'
          setSubmitted(false);
        }}
      />
      {prompt && (
        <div className="mt-4 w-full max-w-md drawing-canvas-main fade-in-up">
          <DrawingCanvas
            disabled={uploading}
            prompt={prompt}
            onFinish={handleFinishDrawing}
          />
        </div>
      )}
      {!prompt && !uploading && (
        <div className="mt-5 text-base text-accent-pink/90 font-titleAlt flex items-center gap-2 fade-in-up">
          <AlertTriangle className="w-4 h-4 mr-1" /> Spin for an animal prompt to start!
        </div>
      )}
      {uploading && (
        <div className="flex flex-col gap-2 items-center mt-8">
          <motion.div
            initial={{ scale: 0.8, rotate: -12 }}
            animate={{
              scale: [0.8, 1.1, 1],
              rotate: [0, 14, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.18, repeatType: "reverse" }}
            className="bg-accent/90 rounded-full p-5 drop-shadow-xl mascot-img flex items-center justify-center"
          >
            <Loader2 className="animate-spin w-14 h-14 text-primary" />
          </motion.div>
          <div className="font-titleAlt text-lg text-accent-pink mt-2 tracking-tight">
            Uploading your amazing doodle...
          </div>
        </div>
      )}
    </div>
  );
}
