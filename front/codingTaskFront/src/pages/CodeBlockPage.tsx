import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import "./../styles/CodeBlockPage.css";
import API from "../api/axios";

// Define the structure of a code block
interface CodeBlock {
  _id: string;
  name: string;
  initialCode: string;
  solution: string;
}

const CodeBlockPage: React.FC = () => {
  const { id } = useParams(); // Get code block ID from URL
  const navigate = useNavigate(); // Hook to navigate between pages
  const [codeBlock, setCodeBlock] = useState<CodeBlock | null>(null);
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [isMentor, setIsMentor] = useState(false);
  const [userRole, setUserRole] = useState<"mentor" | "student" | null>(null);
  const [code, setCode] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"student" | "solution">("student");
  const [isCorrect, setIsCorrect] = useState(false);

  // Fetch the code block and connect to the socket server
  useEffect(() => {
    let newSocket: ReturnType<typeof io> | null = null;
    let mounted = true;

    const fetchCodeBlock = async () => {
      try {
        const response = await API.get(`/api/codeblocks/${id}`);
        if (!mounted) return;
        setCodeBlock(response.data);

        // Create and connect socket
        if (!socket) {
          newSocket = io("http://localhost:3000");
          setSocket(newSocket);

          // Join the correct room
          newSocket.on("connect", () => {
            newSocket!.emit("join_room", {
              roomId: id,
              initialCode: response.data.initialCode,
            });
          });

          interface RoleAssignmentData {
            role: "mentor" | "student";
            code: string;
            studentCount?: number;
          }

          // Handle role assignment (mentor/student) and initialize code
          newSocket.on("role_assignment", (data: RoleAssignmentData) => {
            if (data.role === "mentor") {
              setIsMentor(true);
              setUserRole("mentor");
            } else {
              setIsMentor(false);
              setUserRole("student");
            }
            setCode(data.code);
            if (data.studentCount !== undefined) {
              setStudentCount(data.studentCount);
            }
          });

          // Receive real-time code updates from other students
          newSocket.on("code_update", (data: { code: string }) => {
            console.log("received code from socket", data.code);
            setCode(data.code); // Always update code for non-mentor users
          });

          // Update number of students in the room
          newSocket.on("student_count_update", (data: { count: number }) => {
            setStudentCount(data.count);
          });

          // If mentor disconnects or forces a redirect, go back to lobby
          newSocket.on("mentor_left", () => {
            navigate("/");
          });

          newSocket.on("force_redirect", () => {
            navigate("/");
          });
        }
      } catch (error) {
        console.error("Error in fetchCodeBlock:", error);
        navigate("/");
      }
    };

    fetchCodeBlock();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [id]);

  // When code changes in the editor (only for students)
  const handleEditorChange = (value: string | undefined) => {
    if (!isMentor && socket && value) {
      setCode(value);
      socket.emit("code_update", {
        roomId: id,
        code: value,
        solution: codeBlock?.solution,
      });
    }
  };

  // Check if student's code matches the solution
  const handleSubmit = () => {
    if (code.trim() === codeBlock?.solution.trim()) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  if (!codeBlock) return <div>Loading...</div>;

  return (
    <div className="code-page">
      <div className="code-container">
        <div className="back-button-wrapper">
          <button onClick={() => navigate("/")} className="back-button">
            Back to Lobby
          </button>
        </div>

        <div className="code-header">
          <h1 className="code-title">{codeBlock.name}</h1>
          <div className="code-role">
            <span>
              {userRole === "mentor" ? "Mentor" : "Student"} | {studentCount}{" "}
              {studentCount === 1 ? "student" : "students"} online
            </span>
          </div>
        </div>

        {isMentor && (
          <div className="mentor-tabs">
            <button
              onClick={() => setActiveTab("student")}
              className={`tab-button ${
                activeTab === "student" ? "active-tab" : ""
              }`}
            >
              💻 Student Code
            </button>
            <button
              onClick={() => setActiveTab("solution")}
              className={`tab-button ${
                activeTab === "solution" ? "active-tab" : ""
              }`}
            >
              ✅ Solution
            </button>
          </div>
        )}

        <Editor
          height="60vh"
          language="javascript"
          theme="vs-dark"
          value={
            isMentor
              ? activeTab === "solution"
                ? codeBlock?.solution || ""
                : code
              : code
          }
          options={{ readOnly: isMentor, fontSize: 16 }}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editor.onKeyDown((e) => {
              if (e.code === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            });
          }}
        />

        {!isMentor && (
          <div className="submit-wrapper">
            <button onClick={handleSubmit} className="submit-button">
              🎉 Submit
            </button>
          </div>
        )}

        {isCorrect && <div className="smiley">😄</div>}
      </div>
    </div>
  );
};

export default CodeBlockPage;
