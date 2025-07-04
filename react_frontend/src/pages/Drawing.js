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

  // New state for upload progress and debug info
  const [debugSteps, setDebugSteps] = useState([]);

  // Called by PromptSpin
  const handlePrompt = (p) => {
    setPrompt(p);
    // reset prior submission UI
    setError("");
    setDrawingUrl("");
    setSuccess(false);
    setSubmitted(false);
    setDebugSteps([]);
  };

  // Set by DrawingCanvas after drawing is finished (user hits Submit)
  const handleFinishDrawing = async (dataUrl) => {
    setDebugSteps([]); // clear steps for this run
    if (!prompt) {
      setError("Spin for an animal prompt before submitting!");
      setDebugSteps(["No prompt chosen."]);
      return;
    }
    if (!dataUrl) {
      setError("Drawing required before submitting!");
      setDebugSteps(["No drawing present."]);
      return;
    }
    setDrawingUrl(dataUrl);
    setUploading(true);
    setError("");
    setSubmitted(true);

    const feedbackLog = [];
    const markStep = (step, type = "info") => {
      // show full log in reverse (most recently completed/stuck steps first)
      setDebugSteps((steps) => [...steps, { step, type, timestamp: new Date().toLocaleTimeString() }]);
    };
    try {
      // 1. Store image in Firebase Storage
      const filename = `drawings/${Date.now()}_${Math.floor(Math.random()*100000)}.png`;
      const storageRef = ref(storage, filename);
      markStep("Serializing drawing as PNG...", "info");
      feedbackLog.push("Serializing drawing as PNG...");
      // eslint-disable-next-line no-console
      console.log("[Drawing Upload] Begin upload: " + filename);

      // Defensive: check dataUrl
      if (!dataUrl.startsWith("data:image/png")) {
        markStep("Drawing serialization failed (not a PNG dataUrl)", "error");
        throw new Error("Drawing serialization failed (not a PNG dataUrl).");
      }
      markStep("Serialization OK", "success");

      markStep("Uploading to Firebase Storage...", "info");
      feedbackLog.push("Uploading to Firebase Storage...");
      try {
        await uploadString(storageRef, dataUrl, "data_url");
        markStep("Upload to Firebase Storage: success", "success");
      } catch (err) {
        markStep("Upload to Firebase Storage: failed (" + (err.code || err.message) + ")", "error");
        // Surface Firebase-specific Storage rules error for debug
        if (err.code && err.code === "storage/unauthorized") {
          markStep("-> Check if Firebase Storage Rules allow uploads for authenticated users!", "error");
        }
        throw err;
      }

      markStep("Getting download URL...", "info");
      feedbackLog.push("Getting download URL...");
      let imageUrl;
      try {
        imageUrl = await getDownloadURL(storageRef);
        markStep("Got download URL!", "success");
      } catch (err) {
        markStep("Failed to fetch download URL: " + (err.code || err.message), "error");
        throw err;
      }

      // 2. Firestore doc with drawing/metadata
      const userId = user && user.uid ? user.uid : "anonymous";
      const username = user && user.displayName ? user.displayName : "Unknown";
      markStep("Saving drawing metadata to Firestore...", "info");
      feedbackLog.push("Saving drawing information to Firestore...");

      try {
        const docRef = await addDoc(collection(db, "drawings"), {
          user: userId,
          username: username,
          prompt,
          animal: prompt, // prompt is the animal e.g. "monkey"
          imageUrl,
          guessesCount: 0,
          createdAt: Date.now(),
        });
        markStep("Firestore write success (" + docRef.id + ")", "success");
      } catch (fireErr) {
        // More granular error handling for Firestore
        markStep(
          "Failed to write drawing metadata to Firestore: " + (fireErr.code || fireErr.message),
          "error"
        );
        if (fireErr.code === "permission-denied") {
          markStep("-> Check Firestore security rules: client likely lacks write permissions!", "error");
        }
        throw fireErr;
      }

      markStep("Upload workflow complete!", "success");
      feedbackLog.push("Upload complete!");
      setSuccess(true);
      // eslint-disable-next-line no-console
      console.log("[Drawing Upload] Success:", {filename, imageUrl});
    } catch (err) {
      // Step-wise error trace is now already part of debugSteps state.
      let msg = "Failed to upload drawing. Please check your connection and try again.";
      if (err && err.code === "storage/unauthorized") {
        msg = "App does not have permission to upload drawings. Please check Firebase storage security rules!";
      } else if (err && err.code === "permission-denied") {
        msg = "You do not have permission to save drawings (Firestore permission denied).";
      }
      // Attach special instructions if error is a known Firebase rules issue
      if (err && err.code === "storage/unauthorized") {
        msg += "\n\nHINT: Check your Firebase project storage rules in the Firebase Console → Storage → Rules.";
      } else if (err && err.code === "permission-denied") {
        msg += "\n\nHINT: Check your Firebase project Firestore rules in the Firebase Console → Firestore Database → Rules.";
      }
      if (err && err.message) {
        msg += " (" + err.message + ")";
      }
      if (err && err.stack) {
        // eslint-disable-next-line no-console
        console.error("[Drawing Upload - Stacktrace]:", err.stack);
      }
      setError(
        msg +
        (feedbackLog.length
          ? "\nUpload steps: " + feedbackLog.join(" → ")
          : "") +
        (err && err.code ? "\nFirebase error code: " + err.code : "")
      );
      // eslint-disable-next-line no-console
      console.error("[Drawing Upload Error]:", err);
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
          {/* Debug step log below canvas, only visible while uploading or on upload failure */}
          {(uploading || (!!error && submitted)) && debugSteps.length > 0 && (
            <div className="mt-3 border border-slate-200 rounded bg-white/95 p-3 font-mono text-xs max-h-44 overflow-y-auto">
              <div className="mb-2 font-bold text-slate-500">Upload Debug Steps:</div>
              <ul>
                {debugSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className={
                      (step.type === "error"
                        ? "text-error"
                        : step.type === "success"
                        ? "text-success"
                        : "text-accent-pink") + " mb-1"
                    }
                  >
                    [{step.timestamp}] {step.step}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
