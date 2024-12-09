import { Box, Spinner } from "@chakra-ui/react";
import React from "react";

const ChatLoadingSpinner = () => {
  return (
    <Box
      m={5}
      w={"fit-content"}
      h={"max-content"}
      mx={"auto"}
      my={"50px"}
      alignSelf={"center"}
    >
      {" "}
      <Spinner size={"xl"} />
    </Box>
  );
};

export default ChatLoadingSpinner;
