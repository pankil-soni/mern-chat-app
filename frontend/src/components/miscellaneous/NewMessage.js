import React from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Circle,
  Image,
  Stack,
} from "@chakra-ui/react";

const NewMessage = (props) => {
  const sender = props.sender;
  const data = props.data;
  const handleChatOpen = props.handleChatOpen;
  return (
    <>
      <Flex
        align={"center"}
        justify={"space-between"}
        px={3}
        py={1}
        borderRadius={"5px"}
        bg={"purple.500"}
      >
        <Stack w={"100%"} spacing={2}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            fontSize={"x-small"}
            mx={1}
            p={0}
            color={"white"}
          >
            <Text>new message</Text>
            <Text>now</Text>
          </Box>
          <Box m={0} display={"flex"} justifyContent={"space-between"}>
            <Box display={"flex"} mb={1}>
              <Circle mx={2}>
                <Image
                  src={sender.profilePic}
                  alt="profile"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                  }}
                />
              </Circle>
              <Text color={"white"} fontWeight={"bold"}>
                {sender.name.length > 13
                  ? sender.name.substring(0, 15) + "..."
                  : sender.name}

                <Text
                  color={"white"}
                  fontSize={"sm"}
                  letterSpacing={0}
                  fontWeight={"normal"}
                >
                  {data.text.length > 15
                    ? " " + data.text.substring(0, 15) + "..."
                    : data.text}
                </Text>
              </Text>
            </Box>
            <Button
              size={"sm"}
              colorScheme={"whiteAlpha"}
              color={"white"}
              onClick={() => handleChatOpen(data.conversationId, sender)}
            >
              Open
            </Button>
          </Box>
        </Stack>
      </Flex>
    </>
  );
};

export default NewMessage;
