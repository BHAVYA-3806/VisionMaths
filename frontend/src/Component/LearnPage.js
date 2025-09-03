import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { courses } from "./data";
import { useNavigate } from "react-router-dom";

function LearnPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const classHandler = (e) => setSelectedClass(e.detail);
    const subjectHandler = (e) =>
      setSelectedSubject(
        e.detail.charAt(0).toUpperCase() + e.detail.slice(1).toLowerCase()
      );

    const playHandler = () => {
      if (selectedClass && selectedSubject) {
        const hasVideo = courses.some(
          (c) =>
            c.class === parseInt(selectedClass) &&
            c.subject === selectedSubject &&
            c.videoUrl
        );
        if (hasVideo) {
          navigate("/video-player", {
            state: { selectedClass, selectedSubject },
          });
        } else {
          alert("No video available for selected class and subject.");
        }
      } else {
        alert("Please select class and subject first.");
      }
    };

    window.addEventListener("voice-class", classHandler);
    window.addEventListener("voice-subject", subjectHandler);
    window.addEventListener("voice-play-video", playHandler);

    return () => {
      window.removeEventListener("voice-class", classHandler);
      window.removeEventListener("voice-subject", subjectHandler);
      window.removeEventListener("voice-play-video", playHandler);
    };
  }, [selectedClass, selectedSubject, navigate]);

  const filteredCourses = courses.filter((course) => {
    return (
      (selectedClass ? course.class === parseInt(selectedClass) : true) &&
      (selectedSubject ? course.subject === selectedSubject : true)
    );
  });

  const handleCourseClick = (course) => {
    if (course.videoUrl) {
      navigate("/video-player", {
        state: { selectedClass: course.class, selectedSubject: course.subject },
      });
    } else {
      alert("No video available for this course yet.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <motion.h2
        className="text-3xl font-semibold mb-6 text-sky-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Browse Courses
      </motion.h2>

      <motion.div
        className="flex flex-wrap gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-sky-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-400"
        >
          <option value="">All Classes</option>
          {[1, 2, 3, 4, 5].map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-sky-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-400"
        >
          <option value="">All Subjects</option>
          {["Math", "Science", "English"].map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
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
            onClick={() => handleCourseClick(course)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCourseClick(course);
              }
            }}
          >
            <h3 className="text-lg font-bold text-sky-700">{course.title}</h3>
            <p className="text-sm text-slate-600">Class: {course.class}</p>
            <p className="text-sm text-slate-600">Subject: {course.subject}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default LearnPage;
