import React from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Circle,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import chatContext from "../../context/chatContext";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";
import ProfileMenu from "../Navbar/ProfileMenu";
import { useDisclosure } from "@chakra-ui/react";
import NewMessage from "../miscellaneous/NewMessage";
import wavFile from "../../assets/newmessage.wav";
import { ProfileModal } from "../miscellaneous/ProfileModal";

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

const MyChatList = (props) => {
  var sound = new Audio(wavFile);
  const toast = useToast();
  const context = useContext(chatContext);
  const socket = context.socket;
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    socket.on("new-message", async (data) => {
      var newlist = context.mychatList;

      console.log("data", data);
      console.log("mylist", newlist);

      let chatIndex = newlist.findIndex(
        (chat) => chat._id === data.conversationId
      );
      // context.setactiveChat(data.conversationId);
      if (chatIndex === -1) {
        newlist.unshift(data.conversation);
      }
      chatIndex = newlist.findIndex((chat) => chat._id === data.conversationId);
      newlist[chatIndex].latestmessage = data.text;

      if (context.activeChat !== data.conversationId) {
        newlist[chatIndex].unread[0]++;
        newlist[chatIndex].updatedAt = new Date();
      }

      // If you want to move the updated chat to the beginning of the list
      let updatedChat = newlist.splice(chatIndex, 1)[0];
      newlist.unshift(updatedChat);

      context.setmychatList([...newlist]); // Create a new array to update state

      //find the name of person who sent the message
      let sender = newlist.find((chat) => chat._id === data.conversationId)
        .members[0];

      context.activeChat !== data.conversationId &&
        sound.play().catch((error) => {
          console.log(error);
        });

      context.activeChat !== data.conversationId &&
        toast({
          // title: "New Message",
          // description: data.text,
          status: "success",
          duration: 5000,
          position: "top-right",

          render: () => (
            <NewMessage
              sender={sender}
              data={data}
              handleChatOpen={handleChatOpen}
            />
          ),
        });
    });

    return () => {
      socket.off("new-message");
    };
  });

  const [squery, setsquery] = useState("");

  var chatlist = context.mychatList;
  var data = context.originalChatList;

  const handleUserSearch = async (e) => {
    if (e.target.value !== "") {
      setsquery(await e.target.value);
      const newchatlist = data.filter((chat) => {
        if (
          chat.members[0].name
            .toLowerCase()
            .includes(e.target.value.toLowerCase())
        ) {
          return chat;
        }
      });
      context.setmychatList(newchatlist);
    } else {
      context.setmychatList(context.originalChatList);
    }
  };

  const handleChatOpen = async (chatid, receiver) => {
    try {
      context.setischatLoading(true);
      context.setmessageList([]);
      context.setotherusertyping(false);
      context.setotheruseronline(false);
      const msg = document.getElementById("new-message");
      if (msg) {
        document.getElementById("new-message").value = "";
        document.getElementById("new-message").focus();
      }

      context.setotherusertyping(false);
      await socket.emit("stop-typing", {
        typer: context.user._id,
        conversationId: context.activeChat,
      });
      await socket.emit("leave-chat", context.activeChat);

      socket.emit("join-chat", { room: chatid, user: context.user._id });
      context.setactiveChat(chatid);

      const response = await fetch(
        `${context.ipadd}/message/${chatid}/${context.user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();

      context.setmessageList(jsonData);
      // context.setactiveChat(chatid);
      context.setreceiver(receiver);

      context.setischatLoading(false);

      const newlist = context.mychatList.map((chat) => {
        if (chat._id === chatid) {
          chat.unread[0] = 0;
        }
        return chat;
      });

      context.setmychatList(newlist);

      setTimeout(() => {
        document.getElementById("chat-box")?.scrollTo({
          top: document.getElementById("chat-box").scrollHeight,
          // behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.log(error);
    }
  };

  return !context.loading ? (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        flexDir={"column"}
        mt={1}
        h={"100%"}
      >
        <Flex zIndex={1} justify={"space-between"}>
          <Text mb={"10px"} fontWeight={"bold"} fontSize={"2xl"}>
            Chats
          </Text>

          <Flex>
            <InputGroup w={{ base: "fit-content", md: "fit-content" }} mx={2}>
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="search user"
                onChange={handleUserSearch}
                id="search-input"
              />
            </InputGroup>

            <Box minW={"fit-content"} display={{ base: "block", md: "none" }}>
              <ProfileMenu
                context={context}
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
              />
            </Box>
          </Flex>
        </Flex>

        <Divider my={1} />

        <Button
          m={2}
          colorScheme="purple"
          onClick={() => props.setactiveTab(1)}
        >
          Add new Chat <AddIcon ml={2} fontSize={"12px"} />
        </Button>

        <Box h={"100%"} px={2} flex={1} overflowY={"auto"} sx={scrollbarconfig}>
          {chatlist.map((chat) => (
            <Flex
              key={chat.members[0]._id}
              my={2}
              justify={"space-between"}
              align={"center"}
              w={"100%"}
              overflow={"hidden"}
            >
              <Button
                h={"4em"}
                w={"100%"}
                justifyContent={"space-between"}
                onClick={() => handleChatOpen(chat._id, chat.members[0])}
                colorScheme={
                  chat._id === context.activeChat ? "purple" : "gray"
                }
              >
                <Flex>
                  <Box>
                    <img
                      src={
                        chat.members[0].profilePic ||
                        "https://via.placeholder.com/150"
                      }
                      alt="profile"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                      }}
                    />
                  </Box>
                  <Box ml={3} w={"50%"} textAlign={"left"}>
                    <Text
                      textOverflow={"hidden"}
                      fontSize={"lg"}
                      fontWeight={"bold"}
                    >
                      {chat.members[0].name?.length > 11
                        ? chat.members[0].name?.substring(0, 13) + "..."
                        : chat.members[0].name}
                    </Text>
                    {context.otherusertyping &&
                    chat._id === context.activeChat ? (
                      <Text fontSize={"sm"} color={"purple.100"}>
                        typing...
                      </Text>
                    ) : (
                      <Text fontSize={"sm"} color={"gray.400"}>
                        {chat.latestmessage?.substring(0, 15) +
                          (chat.latestmessage?.length > 15 ? "..." : "")}
                      </Text>
                    )}
                  </Box>
                </Flex>

                <Stack direction={"row"} align={"center"}>
                  <Text textAlign={"right"} fontSize={"x-small"}>
                    {new Date(chat.updatedAt).toDateString() ===
                    new Date().toDateString() ? (
                      <Text mb={1} fontSize={"x-small"}>
                        Today
                      </Text>
                    ) : new Date(chat.updatedAt).toDateString() ===
                      new Date(
                        new Date().setDate(new Date().getDate() - 1)
                      ).toDateString() ? (
                      <Text mb={1} fontSize={"x-small"}>
                        Yesterday
                      </Text>
                    ) : (
                      <Text mb={1} fontSize={"x-small"}>
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </Text>
                    )}
                    {new Date(chat.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>

                  {chat.unread[0] > 0 && (
                    <Circle
                      backgroundColor={"black"}
                      color={"white"}
                      p={1}
                      borderRadius={40}
                      size={"20px"}
                    >
                      <Text fontSize={12} p={1} borderRadius={50}>
                        &nbsp; {chat.unread[0]} &nbsp;
                      </Text>
                    </Circle>
                  )}
                </Stack>
              </Button>
            </Flex>
          ))}
        </Box>
        <ProfileModal
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
          user={context.user}
        />
      </Box>
    </>
  ) : (
    <>
      <Box margin={"auto"} w={"max-content"} mt={"30vh"}>
        <Spinner size={"xl"} />
      </Box>
    </>
  );
};

export default MyChatList;
