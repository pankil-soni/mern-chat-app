import React, { useEffect, useContext, useState } from "react";
import {
  Box,
  Divider,
  Flex,
  useToast,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import chatContext from "../../context/chatContext";
import Chats from "./Chats";
import { ChatArea } from "./ChatArea";

const Dashboard = () => {
  const context = useContext(chatContext);
  const { user, isAuthenticated, activeChatId } = context;
  const navigator = useNavigate();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "You are not logged in",
        description: "Please login to continue",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigator("/");
    }

    return () => {};
  }, [isAuthenticated]);

  setTimeout(async () => {
    if (!isAuthenticated) {
      navigator("/");
    } else {
      setIsLoading((await user) && false);
    }
  }, 1000);

  return (
    <>
      {isLoading && (
        <>
          <Box
            display={"flex"}
            p={3}
            w="99%"
            h="85vh"
            borderRadius="lg"
            borderWidth="1px"
            m={"auto"}
            mt={2}
          >
            <Box
              h={"80vh"}
              w={{
                base: "100%",
                md: "29vw",
              }}
              mt={10}
              mx={2}
            >
              <Divider mb={5} />
              <Stack>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton height="50px" key={i} borderRadius={"lg"} />
                ))}
              </Stack>
            </Box>

            <Box h={"80vh"} w={"75%"} display={{ base: "none", md: "block" }}>
              <Stack mt={5}>
                <SkeletonCircle size="10" mx={2} />

                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonText
                    key={i}
                    mt={4}
                    mx={2}
                    noOfLines={4}
                    spacing={4}
                    borderRadius={"lg"}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </>
      )}
      {!isLoading && (
        <Box
          p={{ base: 0, md: 0 }}
          w={{ base: "93vw", md: "98vw" }}
          h={{ base: "85vh", md: "90vh" }}
          m="0px auto"
          borderRadius="lg"
          borderWidth={{ base: "0px", md: "2px" }}
          minW={"min-content"}
        >
          <Flex h={"100%"}>
            <Box
              display={{
                base: activeChatId !== "" ? "none" : "flex",
                md: "block",
              }}
              w={{ base: "100%", md: "29vw" }}
            >
              <Chats />
            </Box>

            <Box
              h={"inherit"}
              w={{
                base: "100%",
                md: "70vw",
              }}
              minW={"min-content"}
            >
              <ChatArea />
            </Box>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default Dashboard;
