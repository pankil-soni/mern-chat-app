const Message = require("../Models/Message.js");
const Conversation = require("../Models/Conversation.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const imageupload = require("../config/imageupload.js");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const configuration = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);
const modelId = "gemini-pro";
const model = configuration.getGenerativeModel({ model: modelId });

const sendMessage = async (req, res) => {
  var imageurl = "";

  if (req.file) {
    imageurl = await imageupload(req.file, false);
  }

  try {
    const { conversationId, sender, text } = req.body;
    if (!conversationId || !sender || !text) {
      return res.status(400).json({
        error: "Please fill all the fields",
      });
    }

    const conversation = await Conversation.findById(conversationId).populate(
      "members",
      "-password"
    );

    //check if conversation contains bot
    var isbot = false;

    conversation.members.forEach((member) => {
      if (member != sender && member.email.includes("bot")) {
        isbot = true;
      }
    });

    if (!isbot) {
      const newMessage = new Message({
        conversationId,
        sender,
        text,
        imageurl,
        seenby: [sender],
      });

      await newMessage.save();
      console.log("newMessage saved");

      conversation.updatedAt = new Date();
      await conversation.save();

      res.json(newMessage);
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const allMessage = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    });

    messages.forEach((message) => {
      if (!message.seenby.includes(req.params.userid)) {
        console.log("message", message.text);
        console.log("message.seenby", message.seenby);
        message.seenby.push(req.params.userid);
        message.save();
      }
    });


    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const deletemesage = async (req, res) => {
  const msgid = req.body.messageid;
  const userids = req.body.userids;
  try {

    const message = await Message.findById(msgid);

    userids.forEach(async (userid) => {
      if (!message.deletedby.includes(userid)) {
        message.deletedby.push(userid);
      }
    });
    await message.save();
    res.status(200).send("Message deleted successfully");
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const generateairesponse = async (data) => {
  var currentMessages = [];
  const prompt = data.text;
  const user = data.sender;
  const conv = await Conversation.findById(data.conversationId);
  const bot = conv.members.find((member) => member != user);

  const messagelist = await Message.find({
    conversationId: data.conversationId,
  });

  messagelist.forEach((message) => {
    if (message.sender == user) {
      currentMessages.push({
        role: "user",
        parts: message.text,
      });
    } else {
      currentMessages.push({
        role: "model",
        parts: message.text,
      });
    }
  });

  try {
    const chat = model.startChat({
      history: currentMessages,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    var responseText = response.text();

    if (responseText.length < 1) {
      responseText = "Woops!! thats soo long ask me something in short.";
    }

    // Stores the conversation

    Message.insertMany([
      {
        conversationId: data.conversationId,
        sender: user,
        text: prompt,
      },
      {
        conversationId: data.conversationId,
        sender: bot,
        text: responseText,
      },
    ]);

    return responseText;
  } catch (error) {
    console.log(error.message);
    return "some error occured while generating response";
  }
};

module.exports = {
  sendMessage,
  allMessage,
  generateairesponse,
  deletemesage,
};
