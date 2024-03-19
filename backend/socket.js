const socketio = require("socket.io");
const Conversation = require("./Models/Conversation.js");
const { generateairesponse } = require("./Controllers/message_controller.js");
const Message = require("./Models/Message.js");
module.exports = (server) => {
  const io = socketio(server, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Setup user in a room
    socket.on("setup", async (id) => {
      socket.join(id);
      console.log("User joined room", id);
      socket.emit("user setup", id);

      //find all conversations of user and send other user online event
      const conv = await Conversation.find({
        members: { $in: [id] },
      });

      conv.forEach((conversation) => {
        const sock = io.sockets.adapter.rooms.get(conversation.id);
        if (sock) {
          console.log("Other user is online is sent to: ", id);
          io.to(conversation.id).emit("other-user-online", {});
        }
      });
    });

    // Join chat room
    socket.on("join-chat", async (data) => {
      const conv = await Conversation.findById(data.room);
      const userIndex = conv.members.findIndex((user) => user == data.user);

      conv.unread[userIndex] = 0;
      await conv.save({ timestamps: false });
      socket.join(data.room);
      const otheruser = conv.members.filter((user) => user != data.user);
      //find if other user is online

      const otheruserSocket = io.sockets.adapter.rooms.get(
        otheruser.toString()
      );
      console.log("user is:", data.user);
      io.to(data.room).emit("user-joined-room", data.user);

      if (otheruserSocket) {
        console.log("Other user is online is sent to: ", data.user);
        io.to(data.room).emit("other-user-online", {});
      }
    });

    // Leave chat room
    socket.on("leave-chat", (room) => {
      socket.leave(room);
    });

    // Send message
    socket.on("send-message", async (data) => {
      console.log("Received message: ");

      const conversation = await Conversation.findById(
        data.data.conversationId
      ).populate("members", "-password");
      conversation.latestmessage = data.data.text;
      var isbot = false;

      const members = conversation.members.map((member) =>
        member.id.toString()
      );

      members.forEach((member) => {
        if (member != data.data.sender) {
          const memberroom = io.sockets.adapter.rooms.get(member);
          if (memberroom) {
            const sid = Array.from(memberroom)[0];
            const chatroom = io.sockets.adapter.rooms.get(
              data.data.conversationId
            );
            if (chatroom && chatroom.has(sid)) {
              data.data.seenby = [member];
            }
          }
        }
      });
      console.log("Members: ", data.data.seenby);
      //find if receiver is in the room or not
      io.to(data.data.conversationId).emit("receive-message", data);

      conversation.members.forEach(async (member) => {
        if (member != data.data.sender && member.email.includes("bot")) {
          // this member is a bot
          isbot = true;
          // send typing event
          io.to(data.data.conversationId).emit("typing", data);
          // generating AI response

          var airesponse = await generateairesponse(data.data);

          const aidata = {
            data: {
              conversationId: data.data.conversationId,
              sender: member,
              text: airesponse,
              createdAt: new Date(),
            },
          };

          console.log("AI response: ", aidata);

          // send stop typing event and send ai response as message
          io.to(data.data.conversationId).emit("receive-message", aidata);
          io.to(data.data.conversationId).emit("stop-typing", data);
          await conversation.save();
        }
      });

      // for two normal users
      if (!isbot) {
        const ids = conversation.members.map((member) => member.id.toString());

        conversation.unread = conversation.unread.map((unread, index) => {
          if (
            index !== ids.indexOf(data.data.sender) &&
            io.sockets.adapter.rooms.get(data.data.conversationId).size === 1
          ) {
            return unread + 1;
          }
          return unread;
        });

        // console.log("sender", data.data.sender);
        // console.log("conversation", conversation);

        //new message to all members except sender
        conversation.members.forEach((member) => {
          if (member.id.toString() !== data.data.sender) {
            data.data["conversation"] = conversation;
            console.log("Emitting new message to: ", member.id);
            io.to(member.id.toString()).emit("new-message", data.data);
          }
        });
        await conversation.save();
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      io.to(data.conversationId).emit("typing", data);
    });

    // Stop typing indicator
    socket.on("stop-typing", (data) => {
      io.to(data.conversationId).emit("stop-typing", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
