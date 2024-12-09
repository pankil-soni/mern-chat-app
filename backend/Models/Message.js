const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: function () {
        return !this.imageUrl;
      },
    },
    imageUrl: {
      type: String,
      required: function () {
        return !this.text;
      },
    },
    reaction: {
      type: String,
      default: "",
    },
    seenBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deletedFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replyTo: {
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
