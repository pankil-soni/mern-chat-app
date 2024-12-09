import {
  Box,
  Flex,
  Text,
  Button,
  Image,
  Tooltip,
  SkeletonCircle,
  Skeleton,
  Circle,
  Stack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import React, { useContext, useEffect } from "react";
import chatContext from "../../context/chatContext";
import { ProfileModal } from "../miscellaneous/ProfileModal";
import { useDisclosure } from "@chakra-ui/react";

const ChatAreaTop = () => {
  const context = useContext(chatContext);

  const {
    receiver,
    setReceiver,
    activeChatId,
    setActiveChatId,
    setMessageList,
    isChatLoading,
    hostName,
    socket,
  } = context;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const getReceiverOnlineStatus = async () => {
    if (!receiver._id) {
      return;
    }

    try {
      const repsonse = await fetch(
        `${hostName}/user/online-status/${receiver._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      const data = await repsonse.json();
      setReceiver((receiver) => ({
        ...receiver,
        isOnline: data.isOnline,
      }));
    } catch (error) {}
  };

  const handleBack = () => {
    socket.emit("leave-chat", activeChatId);
    setActiveChatId("");
    setMessageList([]);
    setReceiver({});
  };

  const getLastSeenString = (lastSeen) => {
    var lastSeenString = "last seen ";
    if (new Date(lastSeen).toDateString() === new Date().toDateString()) {
      lastSeenString += "today ";
    } else if (
      new Date(lastSeen).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
    ) {
      lastSeenString += "yesterday ";
    } else {
      lastSeenString += `on ${new Date(lastSeen).toLocaleDateString()} `;
    }

    lastSeenString += `at ${new Date(lastSeen).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    return lastSeenString;
  };

  useEffect(() => {
    getReceiverOnlineStatus();
  }, [receiver?._id]);
  return (
    <>
      <Flex w={"100%"}>
        <Button
          borderRadius={0}
          height={"inherit"}
          onClick={() => handleBack()}
        >
          <ArrowBackIcon />
        </Button>
        <Tooltip label="View Profile">
          <Button
            w={"100%"}
            mr={0}
            p={2}
            h={"max-content"}
            justifyContent={"space-between"}
            borderRadius={"0px"}
            onClick={onOpen}
          >
            {isChatLoading ? (
              <>
                <Flex>
                  <SkeletonCircle size="10" mx={2} />
                  <Skeleton
                    height="20px"
                    width="250px"
                    borderRadius={"md"}
                    my={2}
                  />
                </Flex>
              </>
            ) : (
              <>
                <Flex gap={2} alignItems={"center"}>
                  <Image
                    borderRadius="full"
                    boxSize="40px"
                    src={receiver.profilePic}
                    alt=""
                  />

                  <Stack
                    justifyContent={"center"}
                    m={0}
                    p={0}
                    lineHeight={1}
                    gap={0}
                    textAlign={"left"}
                  >
                    <Text mx={1} my={receiver.isOnline ? 0 : 2} fontSize="2xl">
                      {receiver.name}
                    </Text>
                    {receiver.isOnline ? (
                      <Text mx={1} fontSize={"small"}>
                        <Circle
                          size="2"
                          bg="green.500"
                          display="inline-block"
                          borderRadius="full"
                          mx={1}
                        />
                        active now
                      </Text>
                    ) : (
                      <Text my={0} mx={1} fontSize={"xx-small"}>
                        {getLastSeenString(receiver.lastSeen)}
                      </Text>
                    )}
                  </Stack>
                </Flex>
              </>
            )}
          </Button>
        </Tooltip>
      </Flex>

      <ProfileModal isOpen={isOpen} onClose={onClose} user={receiver} />
    </>
  );
};

export default ChatAreaTop;
