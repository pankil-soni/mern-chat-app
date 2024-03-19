const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    imageurl: {
      type: String,
      default: "",
    },
    reaction: {
      type: String,
      default: "",
    },
    seenby: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedby: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replyto: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
