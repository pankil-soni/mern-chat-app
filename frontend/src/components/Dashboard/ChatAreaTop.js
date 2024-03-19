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
  Badge,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import React, { useContext } from "react";
import chatContext from "../../context/chatContext";
import { ProfileModal } from "../miscellaneous/ProfileModal";
import { useDisclosure } from "@chakra-ui/react";

const ChatAreaTop = () => {
  const context = useContext(chatContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleBack = () => {
    context.socket.emit("leave-chat", context.activeChat);
    context.setotheruseronline(false);
    context.setmessageseen(false);
    context.setactiveChat("");
    context.setmessageList([]);
    context.setreceiver({});
  };

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
            h={"3.5em"}
            justifyContent={"space-between"}
            borderRadius={"0px"}
            onClick={onOpen}
          >
            <Box>
              <Flex>
                {context.ischatLoading ? (
                  <>
                    <SkeletonCircle size="10" mx={2} />
                    <Skeleton
                      height="20px"
                      width="250px"
                      borderRadius={"md"}
                      my={2}
                    />
                  </>
                ) : (
                  <>
                    <Image
                      borderRadius="full"
                      boxSize="40px"
                      src={context.receiver.profilePic}
                      alt=""
                      m={2}
                    />

                    <Flex p={1} flexDirection="column" textAlign={"left"}>
                      <Text
                        mx={1}
                        my={context.otheruseronline ? 0 : 2}
                        fontSize="2xl"
                      >
                        {context.receiver.name}
                      </Text>
                      {context.otheruseronline && (
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
                      )}
                    </Flex>
                  </>
                )}
              </Flex>
            </Box>
          </Button>
        </Tooltip>
      </Flex>

      <ProfileModal isOpen={isOpen} onClose={onClose} user={context.receiver} />
    </>
  );
};

export default ChatAreaTop;
