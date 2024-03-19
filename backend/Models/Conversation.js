const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestmessage: {
      type: String,
      default: "",
    },
    unread: {
      type: [Number],
      default: [0, 0],
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;
