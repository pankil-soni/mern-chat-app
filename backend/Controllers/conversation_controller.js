const Conversation = require("../Models/Conversation.js");

const accessConversation = async (req, res) => {
  try {
    const { members } = req.body;

    if (!members) {
      return res.status(400).json({
        error: "Please fill all the fields",
      });
    }

    const conv = await Conversation.findOne({
      members: { $all: members },
    }).populate("members", "-password");

    if (conv) {
      conv.members = conv.members.filter((member) => member.id !== req.user.id);
      return res.status(200).json(await conv);
    }

    const newConversation = new Conversation({
      members,
    });

    await newConversation.save();

    const convn = await newConversation
      .populate("members", "-password")
      .execPopulate();

    newConversation.members = convn.members.filter(
      (member) => member.id !== req.user.id
    );

    return res.status(200).json(await convn);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate(
      "members",
      "-password",
      "-phoneNum"
    );

    if (!conversation) {
      return res.status(404).json({
        error: "No conversation found",
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const getConversationList = async (req, res) => {
  const userId = req.user.id;

  try {
    const conversationList = await Conversation.find({
      members: { $in: userId },
    }).populate("members", "-password");

    if (!conversationList) {
      return res.status(404).json({
        error: "No conversation found",
      });
    }

    var index = 0;

    conversationList.forEach((conversation) => {
      index = conversation.members.findIndex((member) => {
        return member.id == userId;
      });

      conversation.unread = [conversation.unread[index]];
    });

    // remove user from members and also other chatbots
    for (let i = 0; i < conversationList.length; i++) {
      conversationList[i].members = conversationList[i].members.filter(
        (member) => member.id !== userId
      );
    }

    conversationList.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    res.status(200).json(conversationList);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  accessConversation,
  getConversation,
  getConversationList,
};
