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
  // Destructure props
  const { sender, data, handleChatOpen } = props;

  return (
    <Flex
      align="center"
      justify="space-between"
      px={3}
      py={1}
      borderRadius={5}
      bg="purple.500"
    >
      <Stack w="100%" spacing={2}>
        {/* Timestamp and indication of new message */}
        <Box
          display="flex"
          justifyContent="space-between"
          fontSize="x-small"
          mx={1}
          p={0}
          color="white"
        >
          <Text>New message</Text>
          <Text>Now</Text>
        </Box>
        <Box m={0} display="flex" justifyContent="space-between">
          <Box display="flex" mb={1}>
            {/* Sender profile picture */}
            <Circle mx={2}>
              <Image
                src={sender.profilePic}
                alt="Profile"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                }}
              />
            </Circle>
            {/* Sender name and truncated message text */}
            <Text color="white" fontWeight="bold">
              {sender.name.length > 13
                ? sender.name.substring(0, 15) + "..."
                : sender.name}
              <Text
                color="white"
                fontSize="sm"
                letterSpacing={0}
                fontWeight="normal"
              >
                {data.text.length > 15
                  ? " " + data.text.substring(0, 15) + "..."
                  : data.text}
              </Text>
            </Text>
          </Box>
          {/* Button to open the chat associated with the message */}
          <Button
            size="sm"
            colorScheme="whiteAlpha"
            color="white"
            onClick={() => handleChatOpen(data.conversationId, sender)}
          >
            Open
          </Button>
        </Box>
      </Stack>
    </Flex>
  );
};

export default NewMessage;
