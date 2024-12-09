import React, { useState, useContext, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabPanels,
  TabPanel,
  Button,
  Input,
  Stack,
  Text,
  Flex,
  IconButton,
  Image,
  Circle,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, EditIcon } from "@chakra-ui/icons";
import chatContext from "../../context/chatContext";
import _isEqual from "lodash/isEqual";
import { useToast } from "@chakra-ui/react";

export const ProfileModal = ({ isOpen, onClose, user, setUser }) => {
  const context = useContext(chatContext);
  const { hostName } = context;
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showchangepassword, setshowchangepassword] = useState(false);

  const toast = useToast();

  // if user is not defined then wait for the user to be fetched
  useEffect(() => {
    if (!_isEqual(user, editedUser)) {
      setEditedUser(user);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setUser(editedUser);
    } catch (error) {}

    context.setUser(editedUser);

    // send the updated user to the server

    try {
      const response = await fetch(`${hostName}/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(editedUser),
      });

      const json = await response.json();

      if (response.status !== 200) {
        toast({
          title: "An error occurred.",
          description: json.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "User updated",
          description: "User updated successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setEditing(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleMouseOver = () => {
    setShowEditIcon(true);
  };

  const handleMouseOut = () => {
    setShowEditIcon(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader p={6} borderBottomWidth="1px" borderColor="gray.100">
          <Flex mt={3} justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold">
              Profile
            </Text>
            <IconButton
              aria-label="Edit profile"
              icon={<EditIcon />}
              variant="ghost"
              colorScheme="purple"
              display={user._id !== context.user?._id ? "none" : "block"}
              onClick={handleEdit}
            />
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs
            isFitted
            variant="enclosed"
            index={editing ? 1 : 0}
            onChange={(index) => setEditing(index === 1)}
          >
            <TabPanels>
              <TabPanel>
                <Stack spacing={2}>
                  <Image
                    borderRadius="full"
                    boxSize={{ base: "100px", md: "150px" }}
                    src={user.profilePic}
                    alt="Dan Abramov"
                    mx="auto"
                  />
                  <Text fontSize="xx-large" fontWeight="bold">
                    {user.name}
                  </Text>
                  <Text fontSize="md">About: {user.about}</Text>
                  <Text fontSize="md">email: {user.email}</Text>
                </Stack>
              </TabPanel>
              <TabPanel>
                <Stack spacing={4}>
                  <Circle
                    cursor="pointer"
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onClick={() => {
                      console.log("clicked");
                    }}
                  >
                    <Image
                      borderRadius="full"
                      boxSize={{ base: "100px", md: "150px" }}
                      src={user.profilePic}
                      alt="profile-pic"
                      mx="auto"
                    />
                    {showEditIcon && (
                      <Box
                        textAlign={"center"}
                        position="absolute"
                        top="auto"
                        left="auto"
                      >
                        <IconButton
                          aria-label="Edit profile picture"
                          icon={<EditIcon />}
                        ></IconButton>
                        <Text fontSize={"xx-small"}>click to edit profile</Text>
                      </Box>
                    )}
                  </Circle>
                  <Input
                    name="name"
                    placeholder="Name"
                    value={editedUser.name}
                    onChange={handleChange}
                  />
                  <Input
                    name="about"
                    placeholder="about"
                    value={editedUser.about}
                    onChange={handleChange}
                  />
                  <Button
                    onClick={() => setshowchangepassword(!showchangepassword)}
                  >
                    change my password{" "}
                    {showchangepassword ? (
                      <ChevronUpIcon />
                    ) : (
                      <ChevronDownIcon />
                    )}
                  </Button>
                  {showchangepassword && (
                    <Box>
                      <Input
                        name="oldpassword"
                        placeholder="old password"
                        type="password"
                        onChange={handleChange}
                        mb={2}
                      />
                      <Input
                        name="newpassword"
                        placeholder="new password"
                        type="password"
                        onChange={handleChange}
                      />
                    </Box>
                  )}
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          {editing ? (
            <Button colorScheme="purple" mr={3} onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button
              colorScheme="purple"
              display={user._id !== context.user?._id ? "none" : "block"}
              mr={3}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          {editing && <Button onClick={() => setEditing(false)}>Back</Button>}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
