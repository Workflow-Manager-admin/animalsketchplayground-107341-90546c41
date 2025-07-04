import React, { useState } from "react";
import PromptSpin from "../components/PromptSpin";
import DrawingCanvas from "../components/DrawingCanvas";
import { db, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

// PUBLIC_INTERFACE
export default function Drawing({ user, onBack }) {
  const [prompt, setPrompt] = useState("");
  const [drawingUrl, setDrawingUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePrompt = (p) => setPrompt(p);

  const handleFinishDrawing = async (dataUrl) => {
    setDrawingUrl(dataUrl);
    setUploading(true);
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
        animal: prompt.split(" ").pop(),
        imageUrl,
        guessesCount: 0,
        createdAt: Date.now()
      });
      setSuccess(true);
    } catch (error) {
      alert("Error uploading drawing. Try again!");
    }
    setUploading(false);
  };

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background-gradient2 to-background-gradient1 px-3 py-7">
      <button onClick={onBack} className="btn btn-link absolute top-4 left-4 btn-sm text-primary">
        <ArrowLeft /> Back
      </button>
      <h1 className="font-titleAlt text-2xl text-primary mb-3">🎨 Add a Drawing!</h1>
      <PromptSpin onPrompt={handlePrompt} />
      {prompt && (
        <div className="mt-4 w-full max-w-md">
          <DrawingCanvas
            disabled={uploading}
            prompt={prompt}
            onFinish={handleFinishDrawing}
          />
        </div>
      )}
      {uploading && (
        <div className="flex flex-col gap-2 items-center mt-4 text-primary">
          <Loader2 className="animate-spin w-10 h-10" />
          Uploading drawing...
        </div>
      )}
    </div>
  );
}
