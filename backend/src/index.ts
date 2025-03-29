import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import codeblockRoutes from "./routes/codeblock_route";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS config
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/codeblocks", codeblockRoutes);

// Define the Connection interface
interface Connection {
  socketId: string;
  isMentor: boolean;
}

// Global tracking of all connections
const globalConnectionLog: Record<
  string,
  { mentorCount: number; connections: Connection[] }
> = {};

io.on("connection", (socket) => {
  console.log(`New socket connected: ${socket.id}`);

  socket.on("code_update", ({ roomId, code }) => {
    io.to(roomId).emit("code_update", { code });
  });

  socket.on("join_room", (data) => {
    const { roomId, initialCode } = data;
    console.log(`Socket ${socket.id} attempting to join room ${roomId}`);

    // Ensure room exists in global log
    if (!globalConnectionLog[roomId]) {
      globalConnectionLog[roomId] = {
        mentorCount: 0,
        connections: [],
      };
    }

    // Determine mentor status
    const isMentor = globalConnectionLog[roomId].mentorCount === 0;

    // Log connection details
    globalConnectionLog[roomId].connections.push({
      socketId: socket.id,
      isMentor: isMentor,
    });

    // Update mentor count if this is a mentor
    if (isMentor) {
      globalConnectionLog[roomId].mentorCount++;
    }

    // Join the room
    socket.join(roomId);

    // Get room members (excluding the current socket)
    const roomMembers = Array.from(
      io.sockets.adapter.rooms.get(roomId) || []
    ).filter((id) => id !== socket.id);

    // Prepare role assignment
    const role = isMentor ? "mentor" : "student";
    console.log(`Assigning role to ${socket.id}: ${role}`);

    // Emit role assignment
    socket.emit("role_assignment", {
      role: role,
      code: initialCode,
      studentCount: globalConnectionLog[roomId].connections.filter(
        (c) => !c.isMentor
      ).length,
    });

    // Update student count
    const studentCount = globalConnectionLog[roomId].connections.filter(
      (c) => !c.isMentor
    ).length;

    io.to(roomId).emit("student_count_update", {
      count: studentCount,
    });

    // Log global connection state
    console.log(
      "Global Connection Log:",
      JSON.stringify(globalConnectionLog, null, 2)
    );

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected from room ${roomId}`);

      // Remove this connection from log
      if (globalConnectionLog[roomId]) {
        globalConnectionLog[roomId].connections = globalConnectionLog[
          roomId
        ].connections.filter((conn: Connection) => conn.socketId !== socket.id);

        // If mentor disconnects, reset mentor status
        if (isMentor) {
          globalConnectionLog[roomId].mentorCount--;

          // Broadcast that mentor left
          socket.to(roomId).emit("mentor_left");

          // Force all students to redirect to lobby
          io.to(roomId).emit("force_redirect");

          // Clear in-memory code state (reset room tracking)
          delete globalConnectionLog[roomId];
        }
      }
    });
  });
});

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI as string;
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
