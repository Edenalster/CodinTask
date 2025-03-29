"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const codeblock_route_1 = __importDefault(require("./routes/codeblock_route"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Initialize Socket.IO server with CORS config
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/codeblocks", codeblock_route_1.default);
// Global tracking of all connections
const globalConnectionLog = {};
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
        const roomMembers = Array.from(io.sockets.adapter.rooms.get(roomId) || []).filter((id) => id !== socket.id);
        // Prepare role assignment
        const role = isMentor ? "mentor" : "student";
        console.log(`Assigning role to ${socket.id}: ${role}`);
        // Emit role assignment
        socket.emit("role_assignment", {
            role: role,
            code: initialCode,
            studentCount: globalConnectionLog[roomId].connections.filter((c) => !c.isMentor).length,
        });
        // Update student count
        const studentCount = globalConnectionLog[roomId].connections.filter((c) => !c.isMentor).length;
        io.to(roomId).emit("student_count_update", {
            count: studentCount,
        });
        // Log global connection state
        console.log("Global Connection Log:", JSON.stringify(globalConnectionLog, null, 2));
        // Cleanup on disconnect
        socket.on("disconnect", () => {
            console.log(`Socket ${socket.id} disconnected from room ${roomId}`);
            // Remove this connection from log
            if (globalConnectionLog[roomId]) {
                globalConnectionLog[roomId].connections = globalConnectionLog[roomId].connections.filter((conn) => conn.socketId !== socket.id);
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
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose_1.default.connect(uri);
        console.log("MongoDB connected");
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    (0, exports.connectDB)();
    console.log(`Server running on port ${PORT}`);
});
