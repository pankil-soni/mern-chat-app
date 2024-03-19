import React from "react";
import {
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { ProfileModal } from "../miscellaneous/ProfileModal";
import { useColorMode } from "@chakra-ui/react";

const ProfileMenu = (props) => {
  // Accessing color mode and toggle function from Chakra UI
  const { colorMode, toggleColorMode } = useColorMode();

  // Using React Router's navigate hook
  const navigator = useNavigate();

  // Extracting user data from props
  const user = props.context.user;

  // Function to handle logout
  const handleLogout = async (e) => {
    e.preventDefault();
    // Clear user authentication and data
    props.context.setisauthenticated(false);
    props.context.setuser({});
    props.context.setmessageList([]);
    props.context.setactiveChat("");
    props.context.setreceiver({});
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Redirect to home page
    navigator("/");
  };

  return (
    <>
      {/* Profile Menu */}
      <Menu>
        {
          // Display user profile button
          <>
            <MenuButton
              isActive={props.isOpen}
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={
                <Image
                  boxSize="26px"
                  borderRadius="full"
                  src={user.profilePic}
                  alt="profile-pic"
                />
              }
            >
              <Text
                display={{
                  base: "none",
                  md: "block",
                }}
                fontSize={"13px"}
              >
                {user.name}
              </Text>
            </MenuButton>
            {/* Dropdown Menu List */}
            <MenuList>
              {/* Menu Item to open profile modal */}
              <MenuItem onClick={props.onOpen}>My Profile</MenuItem>
              {/* Menu Item to toggle color mode */}
              <MenuItem
                display={{
                  base: "block",
                  md: "none",
                }}
                onClick={toggleColorMode}
              >
                {/* Display light or dark mode based on current mode */}
                {localStorage.getItem("chakra-ui-color-mode") === "light"
                  ? "Dark Mode"
                  : "Light Mode"}
              </MenuItem>
              {/* Menu Item to logout */}
              <MenuItem color={"red"} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </>
        }
      </Menu>
      {/* Profile Modal */}
      <ProfileModal
        isOpen={props.isOpen}
        onClose={props.onClose}
        user={props.context.user}
        setuser={props.context.setuser}
      />
    </>
  );
};

export default ProfileMenu;
