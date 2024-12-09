import React, { useState } from "react";
import { Tabs, TabPanel, TabPanels } from "@chakra-ui/react";
import MyChatList from "./MyChatList";
import NewChats from "./NewChats";

const Chats = () => {
  const [activeTab, setactiveTab] = useState(0);

  return (
    <>
      <Tabs
        isFitted
        variant="enclosed"
        w={{ base: "95vw", md: "100%" }}
        index={activeTab}
        colorScheme="purple"
        h={"100%"}
      >
        <TabPanels>
          <TabPanel
            py={1}
            mt={{ base: 2, md: 0 }}
            px={2}
            w={{ base: "96vw", md: "29vw" }}
            borderRightWidth={{ base: "0px", md: "1px" }}
            h={{
              base: "85vh",
              md: "88.5vh",
            }}
          >
            <MyChatList setactiveTab={setactiveTab} />
          </TabPanel>
          <TabPanel
            mt={{ base: 2, md: 0 }}
            px={{ base: 0, md: 2 }}
            w={{ base: "96vw", md: "29vw" }}
            // h={{ base: "80vh", md: "88.5vh" }}
            borderRightWidth={{ base: "0px", md: "1px" }}
          >
            <NewChats setactiveTab={setactiveTab} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default Chats;
