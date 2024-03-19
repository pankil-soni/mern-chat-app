import React, { useState } from "react";
import {
  ArrowForwardIcon,
  CheckCircleIcon,
  CopyIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import Lottie from "react-lottie";
import animationdata from "../../typingAnimation.json";
import {
  Box,
  Image,
  InputGroup,
  Input,
  Text,
  InputRightElement,
  Button,
  FormControl,
  Flex,
  Tooltip,
  InputLeftElement,
  Circle,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Stack,
} from "@chakra-ui/react";
import ChatAreaTop from "./ChatAreaTop";
import { useContext } from "react";
import chatContext from "../../context/chatContext";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { marked } from "marked";
import { FaFileUpload } from "react-icons/fa";
import { useDisclosure } from "@chakra-ui/react";
import FileUploadModal from "../miscellaneous/FileUploadModal";
import ChatLoadingSpinner from "../miscellaneous/ChatLoadingSpinner";
import DeleteMessageModal from "../miscellaneous/DeleteMessageModal";

const scrollbarconfig = {
  "&::-webkit-scrollbar": {
    width: "5px",
    height: "5px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "gray.300",
    borderRadius: "5px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "gray.400",
  },
  "&::-webkit-scrollbar-track": {
    display: "none",
  },
};

const markdownToHtml = (markdownText) => {
  const html = marked(markdownText);
  return { __html: html };
};

export const ChatArea = () => {
  const context = useContext(chatContext);
  const [showDelete, setshowDelete] = useState(false);
  const [selectedMessage, setselectedMessage] = useState("");
  const [typing, settyping] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isopendelete,
    onOpen: onOpendelete,
    onClose: onclosedelete,
  } = useDisclosure();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationdata,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    return () => {
      window.addEventListener("popstate", () => {
        context.socket.emit("leave-chat", context.activeChat);
        context.setactiveChat("");
        context.setmessageList([]);
        context.setreceiver({});
      });
    };
  });

  useEffect(() => {
    context.socket.on("user-joined-room", async (userid) => {
      var messagelist = context.messageList.map((message) => {
        if (message.sender === context.user._id) {
          if (message.seenby) {
            message.seenby.push(userid);
          } else {
            message.seenby = [userid];
          }
        }
        return message;
      });
      console.log(messagelist);
      context.setmessageList(messagelist);
    });

    context.socket.on("typing", (data) => {
      console.log(data.typer);
      console.log(context.user._id);
      console.log(data.typer === context.user._id);
      if (data.typer !== context.user._id) {
        context.setotherusertyping(true);
      }
    });

    context.socket.on("stop-typing", (data) => {
      if (data.typer !== context.user._id) {
        context.setotherusertyping(false);
      }
    });

    context.socket.on("receive-message", async (data) => {
      context.setmessageList([...context.messageList, data.data]);

      setTimeout(() => {
        document.getElementById("chat-box")?.scrollTo({
          top: document.getElementById("chat-box").scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    });

    return () => {
      context.socket.off("typing");
      context.socket.off("stop-typing");
      context.socket.off("receive-message");
    };
  });

  const toast = useToast();

  const handleTyping = (e) => {
    if (document.getElementById("new-message").value === "" && typing) {
      settyping(false);
      context.socket.emit("stop-typing", {
        typer: context.user._id,
        conversationId: context.activeChat,
      });
    } else {
      settyping(true);
      context.socket.emit("typing", {
        typer: context.user._id,
        conversationId: context.activeChat,
      });
    }
  };

  var messages = context.messageList;

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage(e);
    }
  };

  const handleRightClick = (e, messageid) => {
    e.preventDefault();
    setshowDelete(true);
    setselectedMessage(messageid);

    document.addEventListener("click", () => {
      setshowDelete(false);
    });
  };

  const handleSendMessage = async (e, messageText, file) => {
    e.preventDefault();

    context.setmessageseen(false);

    if (!messageText) {
      messageText = document.getElementById("new-message").value;
    }

    context.socket.emit("stop-typing", {
      typer: context.user._id,
      conversationId: context.activeChat,
    });

    if (messageText === "") {
      toast({
        title: "Message cannot be empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const formData = new FormData();

      const data = {
        text: messageText,
        conversationId: context.activeChat,
        sender: context.user._id,
        createdAt: new Date().toUTCString(),
        _id: context.user._id + "" + Date.now(),
      };

      if (file) {
        formData.append("file", file);
        data.imageurl = URL.createObjectURL(file);
      }
      formData.append("text", messageText);
      formData.append("conversationId", context.activeChat);
      formData.append("sender", context.user._id);
      formData.append("createdAt", new Date().toUTCString());
      formData.append("_id", context.user._id + "" + Date.now());

      fetch(`${context.ipadd}/message/send`, {
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
        body: formData,
      });

      context.socket.emit("send-message", {
        data,
      });

      document.getElementById("new-message").value = "";

      setTimeout(() => {
        document.getElementById("chat-box")?.scrollTo({
          top: document.getElementById("chat-box").scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }

    //move active chat to top in context.mychatList

    context.setmychatList(
      await context.mychatList
        .map((chat) => {
          if (chat._id === context.activeChat) {
            chat.latestmessage = messageText;
            chat.updatedAt = new Date().toUTCString();
            console.log(chat);
          }
          return chat;
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  const handleDeleteMessage = async (deletefrom) => {
    var messagelist = context.messageList.filter(
      (message) => message._id !== selectedMessage
    );
    context.setmessageList(messagelist);
    setshowDelete(false);
    onclosedelete();

    const userids = [];
    userids.push(context.user._id);
    if (deletefrom == 2) {
      userids.push(context.receiver._id);
    }

    const data = {
      messageid: selectedMessage,
      userids,
    };

    console.log(data);

    fetch(`${context.ipadd}/message/delete`, {
      method: "POST",
      headers: {
        "auth-token": localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  return (
    <>
      {context.activeChat !== "" ? (
        <>
          <Box
            // display={"flex"}
            // flexDir="column"
            justifyContent="space-between"
            h={"100%"}
            w={{
              base: "100vw",
              md: "100%",
            }}
          >
            <ChatAreaTop />
            {context.ischatLoading && <ChatLoadingSpinner />}

            <DeleteMessageModal
              isOpen={isopendelete}
              handleDeleteMessage={handleDeleteMessage}
              onClose={onclosedelete}
            />

            <Box
              id="chat-box"
              h={"85%"}
              // flex={1}
              overflowY="auto"
              sx={scrollbarconfig}
              mt={1}
              mx={1}
            >
              {messages?.map(
                (message) =>
                  !message.deletedby?.includes(context.user._id) && (
                    <Flex
                      justify={
                        message.sender === context.user._id ? "end" : "start"
                      }
                      mx={2}
                      key={message._id}
                      onContextMenu={(e) =>
                        message.sender === context.user._id
                          ? handleRightClick(e, message._id)
                          : null
                      }

                      //onlong press
                    >
                      <Flex w={"max-content"}>
                        {showDelete && message._id === selectedMessage && (
                          <Box my={3}>
                            <Button
                              onClick={function (e) {
                                e.preventDefault();
                                onOpendelete();
                              }}
                              mr={2}
                            >
                              <DeleteIcon />
                            </Button>
                            <Tooltip label="copy">
                              <Button
                                mr={2}
                                onClick={() =>
                                  toast({
                                    duration: 1000,
                                    render: () => (
                                      <Box
                                        color="white"
                                        p={3}
                                        bg="purple.300"
                                        borderRadius={"lg"}
                                      >
                                        Message copied to clipboard!!
                                      </Box>
                                    ),
                                  }) ||
                                  navigator.clipboard.writeText(message.text)
                                }
                              >
                                <CopyIcon />
                              </Button>
                            </Tooltip>
                          </Box>
                        )}

                        {message.sender !== context.user._id && (
                          <Image
                            borderRadius={"50%"}
                            src={context.receiver.profilePic}
                            alt="Sender"
                            w={"20px"}
                            h={"20px"}
                            mr={1}
                            alignSelf={"center"}
                          />
                        )}
                        <Stack spacing={0}>
                          {message.replyto && (
                            <Box
                              my={1}
                              p={2}
                              borderRadius={10}
                              bg={
                                message.sender === context.user._id
                                  ? "purple.200"
                                  : "blue.200"
                              }
                              mx={2}
                              color="white"
                              w={"max-content"}
                              maxW={"60vw"}
                              alignSelf={
                                message.sender === context.user._id
                                  ? "flex-end"
                                  : "flex-start"
                              }
                            >
                              reply to
                            </Box>
                          )}
                          <Box
                            alignSelf={
                              message.sender === context.user._id
                                ? "flex-end"
                                : "flex-start"
                            }
                            position={"relative"}
                            my={1}
                            p={2}
                            borderRadius={10}
                            bg={
                              message.sender === context.user._id
                                ? "purple.300"
                                : "blue.300"
                            }
                            color="white"
                            w={"max-content"}
                            maxW={"60vw"}
                          >
                            {message.imageurl && (
                              <Image
                                src={message.imageurl}
                                alt="loading..."
                                w={"200px"}
                                maxW={"40vw"}
                                borderRadius={"10px"}
                                mb={2}
                              />
                            )}
                            <Text
                              overflowX={"scroll"}
                              sx={scrollbarconfig}
                              dangerouslySetInnerHTML={markdownToHtml(
                                message?.text
                              )}
                            ></Text>
                            <Flex justify={"end"}>
                              <Text
                                align={"end"}
                                fontSize={"10px"}
                                color={"#e6e5e5"}
                              >{`${new Date(
                                message.createdAt
                              ).getHours()}:${new Date(
                                message.createdAt
                              ).getMinutes()}`}</Text>

                              {message.sender === context.user._id &&
                                message.seenby?.includes(
                                  context.receiver._id
                                ) && (
                                  <Circle
                                    ml={1}
                                    fontSize={"x-small"}
                                    color={"green.100"}
                                  >
                                    <CheckCircleIcon />
                                  </Circle>
                                )}
                            </Flex>
                            <Box
                              fontSize={"xs"}
                              position={"absolute"}
                              bg={
                                message.sender === context.user._id
                                  ? "purple.300"
                                  : "blue.300"
                              }
                              bottom={-1}
                              left={-1}
                              borderRadius={"lg"}
                            >
                              {message.reaction}
                            </Box>
                          </Box>
                        </Stack>
                      </Flex>
                    </Flex>
                  )
              )}
            </Box>

            <Box
              py={2}
              position={"fixed"}
              w={{
                base: "100%",
                md: "70%",
              }}
              bottom={{
                base: 1,
                md: 3,
              }}
              backgroundColor={
                localStorage.getItem("chakra-ui-color-mode") === "dark"
                  ? "#1a202c"
                  : "white"
              }
            >
              <Box
                mx={{
                  base: 6,
                  md: 3,
                }}
                w={"fit-content"}
              >
                {context.otherusertyping && (
                  <Lottie
                    options={defaultOptions}
                    height={20}
                    width={20}
                    isStopped={false}
                    isPaused={false}
                  />
                )}
              </Box>
              <FormControl>
                <InputGroup
                  w={{
                    base: "95%",
                    md: "98%",
                  }}
                  m={"auto"}
                  onKeyDown={(e) => handleKeyPress(e)}
                >
                  {!context.receiver?.email?.includes("bot") && (
                    <InputLeftElement>
                      <Button
                        mx={2}
                        size={"sm"}
                        onClick={onOpen}
                        borderRadius={"lg"}
                      >
                        <FaFileUpload />
                      </Button>
                    </InputLeftElement>
                  )}

                  <Input
                    placeholder="Type a message"
                    id={"new-message"}
                    onChange={(e) => handleTyping(e)}
                    borderRadius={"10px"}
                  />

                  <InputRightElement>
                    <Button
                      onClick={(e) =>
                        handleSendMessage(
                          e,
                          document.getElementById("new-message").value
                        )
                      }
                      size={"sm"}
                      mx={2}
                      borderRadius={"10px"}
                    >
                      <ArrowForwardIcon />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Box>
          </Box>
          <FileUploadModal
            isOpen={isOpen}
            onClose={onClose}
            handleSendMessage={handleSendMessage}
          />
        </>
      ) : (
        !context.ischatLoading && (
          <Box
            display={{
              base: "none",
              md: "block",
            }}
            mx={"auto"}
            w={"fit-content"}
            mt={"30vh"}
            h={"max-content"}
            textAlign={"center"}
          >
            <Text fontSize={"6vw"} fontWeight={"bold"} fontFamily={"Work sans"}>
              Conversa
            </Text>
            <Text fontSize={"2vw"}>Online chatting app</Text>
            <Text fontSize={"md"}>Select a chat to start messaging</Text>
          </Box>
        )
      )}
    </>
  );
};
