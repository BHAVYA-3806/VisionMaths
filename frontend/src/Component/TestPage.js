import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { courses } from "./data";
import Tesseract from "tesseract.js";

const TestPage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [voicePrompt, setVoicePrompt] = useState("");
  const [voiceUploadRequested, setVoiceUploadRequested] = useState(false);
  const [ocrText, setOcrText] = useState("");

  const speak = (text) => {
    if (!text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const classHandler = (e) => setSelectedClass(e.detail);
    const subjectHandler = (e) =>
      setSelectedSubject(
        e.detail.charAt(0).toUpperCase() + e.detail.slice(1).toLowerCase()
      );
    const uploadHandler = () => {
      setVoiceUploadRequested(true);
      setVoicePrompt("Say or click 'Upload Image' to continue");
    };

    window.addEventListener("voice-class", classHandler);
    window.addEventListener("voice-subject", subjectHandler);
    window.addEventListener("voice-upload", uploadHandler);

    return () => {
      window.removeEventListener("voice-class", classHandler);
      window.removeEventListener("voice-subject", subjectHandler);
      window.removeEventListener("voice-upload", uploadHandler);
    };
  }, []);

  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.warn("No file selected.");
    return;
  }

  console.log("OCR started...");

  const imageURL = URL.createObjectURL(file);

  try {
    const result = await Tesseract.recognize(imageURL, "eng", {
      logger: (m) => console.log(m), // shows progress
    });

    const text = result.data.text.trim();
    console.log("Extracted text:", text);

    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.cancel(); // cancel any existing speech
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("No text found in the image.");
    }
  } catch (err) {
    console.error("OCR failed:", err);
  }
};


  const filteredCourses = courses.filter((course) => {
    return (
      (selectedClass ? course.class === parseInt(selectedClass) : true) &&
      (selectedSubject ? course.subject === selectedSubject : true)
    );
  });

  return (
    <motion.div
      className="p-6 min-h-screen bg-gradient-to-bl from-blue-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-semibold mb-6 text-blue-700">
        Take a Practice Test
      </h2>

      <motion.div
        className="flex flex-wrap gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-blue-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Class</option>
          {[1, 2, 3, 4, 5].map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-blue-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Subject</option>
          {["Math", "Science", "English"].map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <button
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click();
          }}
          className="border border-blue-300 p-2 rounded-lg shadow-sm text-blue-700 hover:bg-blue-100 transition"
          aria-label="Upload Image"
        >
          Upload Image
        </button>
      </motion.div>

      {voicePrompt && (
        <div className="mb-4 text-yellow-600 font-semibold">{voicePrompt}</div>
      )}

      {uploadedFile && (
        <div className="mt-4 text-green-600 font-medium">
          Uploaded File: {uploadedFile.name}
        </div>
      )}

      {ocrText && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm text-gray-700 whitespace-pre-wrap">
          <strong>Detected Text:</strong>
          <br />
          {ocrText}
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              delayChildren: 0.3,
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition cursor-pointer"
            whileHover={{ scale: 1.05 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            onClick={() => alert(`Start test for: ${course.title}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                alert(`Start test for: ${course.title}`);
              }
            }}
          >
            <h3 className="text-lg font-bold text-blue-700">{course.title}</h3>
            <p className="text-sm text-slate-600">Class: {course.class}</p>
            <p className="text-sm text-slate-600">Subject: {course.subject}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default TestPage;
