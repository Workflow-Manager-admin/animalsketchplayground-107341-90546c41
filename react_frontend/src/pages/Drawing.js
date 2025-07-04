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

  // This state tells if user completed drawing AFTER timer and a prompt is assigned.
  const [canSubmit, setCanSubmit] = useState(false);

  // Called by PromptSpin
  const handlePrompt = (p) => {
    setPrompt(p);
    // reset prior submission UI
    setError("");
    setDrawingUrl("");
    setSuccess(false);
    setSubmitted(false);
    setCanSubmit(false);
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
      const filename = `drawings/${Date.now()}_${Math.random()}.png`;
      const storageRef = ref(storage, filename);
      await uploadString(storageRef, dataUrl, "data_url");
      const imageUrl = await getDownloadURL(storageRef);
      // Add document to Firestore
      await addDoc(collection(db, "drawings"), {
        user: user?.uid,
        username: user?.displayName,
        prompt,
        animal: prompt, // prompt is the animal e.g. "monkey"
        imageUrl,
        guessesCount: 0,
        createdAt: Date.now(),
      });
      setSuccess(true);
    } catch (error) {
      setError("Failed to upload drawing. Please check your connection and try again.");
    }
    setUploading(false);
  };

  // This handler is called by DrawingCanvas when eligible for submission (45s elapsed/timer up)
  // In our component, the DrawingCanvas controls timing and submit logic. We bring down canSubmit to enable final UI.
  // To improve UX, use DrawingCanvas onFinish callback always, but condition button in DrawingCanvas only after 10s elapsed (see DrawingCanvas logic).

  // If submitted and successful
  if (success)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
        <motion.div
          initial={{ scale: 0.2, rotate: -40, opacity: 0.4 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          className="rounded-full p-9 mb-2 bg-info/90 text-white drop-shadow-2xl"
        >
          <ArrowLeft className="w-9 h-9 rotate-45" />
        </motion.div>
        <div className="text-2xl font-titleAlt text-success mb-3">Drawing posted!</div>
        <button className="btn btn-primary px-6 rounded-full" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    );

  // Error alert component
  function ErrorBanner({ message }) {
    if (!message) return null;
    return (
      <motion.div
        className="alert alert-error rounded-lg my-2 flex gap-2 items-center text-base"
        initial={{ scale: 0.8, y: -10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 0, opacity: 0 }}
        role="alert"
      >
        <XCircle className="w-5 h-5" /> {message}
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background-gradient2 to-background-gradient1 px-3 py-7 relative">
      <button
        onClick={onBack}
        className="btn btn-link absolute top-4 left-4 btn-sm text-primary"
        disabled={uploading}
        tabIndex={uploading ? -1 : 0}
      >
        <ArrowLeft /> Back
      </button>
      <h1 className="font-titleAlt text-2xl text-primary mb-3">🎨 Add a Drawing!</h1>
      <PromptSpin onPrompt={handlePrompt} />
      {/* Show error banner below spinner if error related to prompt/flow */}
      <ErrorBanner message={error} />
      {prompt && (
        <div className="mt-4 w-full max-w-md">
          <DrawingCanvas
            disabled={uploading}
            prompt={prompt}
            onFinish={handleFinishDrawing}
          />
        </div>
      )}
      {!prompt && !uploading && (
        <div className="mt-2 text-base text-accent-pink/80 font-titleAlt flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Spin for an animal prompt to start!
        </div>
      )}
      {uploading && (
        <div className="flex flex-col gap-2 items-center mt-6">
          <motion.div
            initial={{ scale: 0.8, rotate: -12 }}
            animate={{
              scale: [0.8, 1.1, 1],
              rotate: [0, 14, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
            className="bg-highlight/90 rounded-full p-4 drop-shadow-xl flex items-center justify-center"
          >
            <Loader2 className="animate-spin w-12 h-12 text-primary" />
          </motion.div>
          <div className="font-titleAlt text-lg text-accent-pink mt-2 tracking-tight">
            Uploading your amazing doodle...
          </div>
        </div>
      )}
    </div>
  );
}
