import React, { useEffect, useState } from "react";
import Timetable from "../../components/Timetable";
import BaseSidebar from "../../components/BaseSidebar";
import Navbar from "../../components/Navbar";

const MyTimetable = () => {
  const [timetableData, setTimetableData] = useState([]); // State for timetable data

  // Sidebar menu items for faculty
  const sidebarItems = [
    { label: "My Courses", path: "/faculty/my-courses", onClick: () => (window.location.href = "/faculty/my-courses") },
    { label: "My Timetable", path: "/faculty/my-timetable", onClick: () => (window.location.href = "/faculty/my-timetable") },
    { label: "Time Availability", path: "/faculty/time-availability", onClick: () => (window.location.href = "/faculty/time-availability") },
  ];

  // Array of colors to rotate through
  const colors = ["#FF5733", "#33B5FF", "#FFC300", "#8A2BE2"];

  // Fetch faculty timetable data from API
  useEffect(() => {
    const fetchTimetableData = async () => {
      try {
        // const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/faculty/${facultyId}/courses`);
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/faculty/1/courses`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Transform API data into timetable format
        let colorIndex = 0; // To keep track of the color rotation
        const timetable = data.courses.flatMap((course) =>
          course.courseRuntimes.map((runtime) => {
            const color = colors[colorIndex % colors.length]; // Rotate through colors
            colorIndex += 1; // Move to the next color
            return {
              day: runtime.day_of_week || "N/A", // Use day_of_week
              courseName: course.course_name, // Course name
              startTime: runtime.start_time, // Start time
              endTime: runtime.end_time, // End time
              color: color, // Assign color
            };
          })
        );

        setTimetableData(timetable); // Set the transformed data
      } catch (error) {
        console.error("Error fetching timetable data:", error);
        setTimetableData([]); // Reset to empty on error
      }
    };

    fetchTimetableData();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <BaseSidebar items={sidebarItems} />

      {/* Main Content */}
      <div className="flex-1">
        <Navbar role="faculty" />
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center mb-6">Faculty My Timetable</h1>
          <Timetable timetableData={timetableData} />
        </div>
      </div>
    </div>
  );
};

export default MyTimetable;
