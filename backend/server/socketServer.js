const { Server } = require("socket.io");
const prisma = require("./prismaClient"); // adjust the path if needed

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
      try {
        // 1. Save to DB
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content,
          },
        });

        // 2. Emit to receiver and sender (if needed)
        io.to(`user-${receiverId}`).emit("receiveMessage", message);
        io.to(`user-${senderId}`).emit("receiveMessage", message); // so sender sees the message too
      } catch (error) {
        console.error("Failed to save message via socket:", error);
        // Optionally: send error back to sender
        socket.emit("messageError", "Message could not be sent");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initSocket;