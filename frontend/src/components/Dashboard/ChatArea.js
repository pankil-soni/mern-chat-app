import React, { useState, useEffect, useContext } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import Lottie from "react-lottie";
import animationdata from "../../typingAnimation.json";
import {
  Box,
  InputGroup,
  Input,
  Text,
  InputRightElement,
  Button,
  FormControl,
  InputLeftElement,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { FaFileUpload } from "react-icons/fa";
import { marked } from "marked";

import chatContext from "../../context/chatContext";
import ChatAreaTop from "./ChatAreaTop";
import FileUploadModal from "../miscellaneous/FileUploadModal";
import ChatLoadingSpinner from "../miscellaneous/ChatLoadingSpinner";
import axios from "axios";
import SingleMessage from "./SingleMessage";

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
  const {
    hostName,
    user,
    receiver,
    socket,
    activeChatId,
    messageList,
    setMessageList,
    isOtherUserTyping,
    setIsOtherUserTyping,
    setActiveChatId,
    setReceiver,
    setMyChatList,
    myChatList,
    isChatLoading,
  } = context;
  const [typing, settyping] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Lottie Options for typing
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
        socket.emit("leave-chat", activeChatId);
        setActiveChatId("");
        setMessageList([]);
        setReceiver({});
      });
    };
  }, [socket, activeChatId, setActiveChatId, setMessageList, setReceiver]);

  useEffect(() => {
    socket.on("user-joined-room", (userId) => {
      const updatedList = messageList.map((message) => {
        if (message.senderId === user._id && userId !== user._id) {
          const index = message.seenBy.findIndex(
            (seen) => seen.user === userId
          );
          if (index === -1) {
            message.seenBy.push({ user: userId, seenAt: new Date() });
          }
        }
        return message;
      });
      setMessageList(updatedList);
    });

    socket.on("typing", (data) => {
      if (data.typer !== user._id) {
        setIsOtherUserTyping(true);
      }
    });

    socket.on("stop-typing", (data) => {
      if (data.typer !== user._id) {
        setIsOtherUserTyping(false);
      }
    });

    socket.on("receive-message", (data) => {
      setMessageList((prev) => [...prev, data]);
      setTimeout(() => {
        document.getElementById("chat-box")?.scrollTo({
          top: document.getElementById("chat-box").scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    });

    socket.on("message-deleted", (data) => {
      const { messageId } = data;
      setMessageList((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("receive-message");
      socket.off("message-deleted");
    };
  }, [socket, messageList, setMessageList, user._id, setIsOtherUserTyping]);

  const handleTyping = () => {
    const messageInput = document.getElementById("new-message");
    if (!messageInput) return;

    if (messageInput.value === "" && typing) {
      settyping(false);
      socket.emit("stop-typing", {
        typer: user._id,
        conversationId: activeChatId,
      });
    } else if (messageInput.value !== "" && !typing) {
      settyping(true);
      socket.emit("typing", {
        typer: user._id,
        conversationId: activeChatId,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage(e);
    }
  };

  const getPreSignedUrl = async (fileName, fileType) => {
    if (!fileName || !fileType) return;
    try {
      const response = await fetch(
        `${hostName}/user/presigned-url?filename=${fileName}&filetype=${fileType}`,
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get pre-signed URL");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendMessage = async (e, messageText, file) => {
    e.preventDefault();
    const awsHost = "https://conversa-chat.s3.ap-south-1.amazonaws.com/";

    if (!messageText) {
      messageText = document.getElementById("new-message")?.value || "";
    }

    socket.emit("stop-typing", {
      typer: user._id,
      conversationId: activeChatId,
    });

    if (messageText === "" && !file) {
      toast({
        title: "Message cannot be empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let key;
    if (file) {
      try {
        const { url, fields } = await getPreSignedUrl(file.name, file.type);
        const formData = new FormData();
        Object.entries({ ...fields, file }).forEach(([k, v]) => {
          formData.append(k, v);
        });

        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status !== 201) {
          throw new Error("Failed to upload file");
        }

        key = fields.key;
      } catch (error) {
        toast({
          title: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    const data = {
      text: messageText,
      conversationId: activeChatId,
      senderId: user._id,
      imageUrl: file ? `${awsHost}${key}` : null,
    };

    socket.emit("send-message", data);

    const inputElem = document.getElementById("new-message");
    if (inputElem) {
      inputElem.value = "";
    }

    setTimeout(() => {
      document.getElementById("chat-box")?.scrollTo({
        top: document.getElementById("chat-box").scrollHeight,
        behavior: "smooth",
      });
    }, 100);

    setMyChatList(
      await myChatList
        .map((chat) => {
          if (chat._id === activeChatId) {
            chat.latestmessage = messageText;
            chat.updatedAt = new Date().toUTCString();
          }
          return chat;
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  const removeMessageFromList = (messageId) => {
    setMessageList((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  return (
    <>
      {activeChatId !== "" ? (
        <>
          <Box
            justifyContent="space-between"
            h="100%"
            w={{
              base: "100vw",
              md: "100%",
            }}
          >
            <ChatAreaTop />

            {isChatLoading && <ChatLoadingSpinner />}

            <Box
              id="chat-box"
              h="85%"
              overflowY="auto"
              sx={scrollbarconfig}
              mt={1}
              mx={1}
            >
              {messageList?.map((message) =>
                !message.deletedby?.includes(user._id) ? (
                  <SingleMessage
                    key={message._id}
                    message={message}
                    user={user}
                    receiver={receiver}
                    markdownToHtml={markdownToHtml}
                    scrollbarconfig={scrollbarconfig}
                    socket={socket}
                    activeChatId={activeChatId}
                    removeMessageFromList={removeMessageFromList}
                    toast={toast}
                  />
                ) : null
              )}
            </Box>

            <Box
              py={2}
              position="fixed"
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
                w="fit-content"
              >
                {isOtherUserTyping && (
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
                  m="auto"
                  onKeyDown={handleKeyPress}
                >
                  {!receiver?.email?.includes("bot") && (
                    <InputLeftElement>
                      <Button
                        mx={2}
                        size="sm"
                        onClick={onOpen}
                        borderRadius="lg"
                      >
                        <FaFileUpload />
                      </Button>
                    </InputLeftElement>
                  )}

                  <Input
                    placeholder="Type a message"
                    id="new-message"
                    onChange={handleTyping}
                    borderRadius="10px"
                  />

                  <InputRightElement>
                    <Button
                      onClick={(e) =>
                        handleSendMessage(
                          e,
                          document.getElementById("new-message")?.value
                        )
                      }
                      size="sm"
                      mx={2}
                      borderRadius="10px"
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
        !isChatLoading && (
          <Box
            display={{
              base: "none",
              md: "block",
            }}
            mx="auto"
            w="fit-content"
            mt="30vh"
            textAlign="center"
          >
            <Text fontSize="6vw" fontWeight="bold" fontFamily="Work sans">
              Conversa
            </Text>
            <Text fontSize="2vw">Online chatting app</Text>
            <Text fontSize="md">Select a chat to start messaging</Text>
          </Box>
        )
      )}
    </>
  );
};
