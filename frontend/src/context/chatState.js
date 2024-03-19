// Import necessary dependencies and components
import chatContext from "./chatContext";
import { useState, useEffect } from "react";
import io from "socket.io-client";

// Define the IP address for the server
const ipadd = "https://localhost:5000";
// Create a socket connection using Socket.IO
var socket = io(ipadd);

// Define the ChatState component
const ChatState = (props) => {
  // State variables to manage various aspects of the chat application
  const [isauthenticated, setisauthenticated] = useState(
    localStorage.getItem("token") ? true : false
  );
  const [user, setuser] = useState(localStorage.getItem("user") || {});
  const [receiver, setreceiver] = useState({});
  const [messageList, setmessageList] = useState([]);
  const [activeChat, setactiveChat] = useState("");
  const [mychatList, setmychatList] = useState([]);
  const [originalChatList, setoriginalChatList] = useState([]);
  const [otherusertyping, setotherusertyping] = useState(false);
  const [ischatLoading, setischatLoading] = useState(false);
  const [otheruseronline, setotheruseronline] = useState(false);
  const [messageseen, setmessageseen] = useState(false);
  const [loading, setloading] = useState(true);

  // Function to fetch user data from the server
  const fetchData = async () => {
    try {
      const response = await fetch(`${ipadd}/conversation/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      setmychatList(jsonData);
      setloading(false);
      setoriginalChatList(jsonData);
    } catch (error) {
      console.log(error);
    }
  };

  // Effect hook to handle events when other user comes online
  useEffect(() => {
    socket.on("other-user-online", (data) => {
      console.log("other user online");
      setotheruseronline(true);
    });
  }, []);

  // Effect hook to fetch user data and chat data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetch(`${ipadd}/user/login`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
          });
          const data = await res.json();
          setuser(data);
          console.log("user fetched");
          setisauthenticated(true);
          socket.emit("setup", await data._id);
        }
      } catch (error) {
        console.log(error);
        setisauthenticated(false);
        setuser({});
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    // Call fetchUser and fetchData functions
    fetchUser();
    fetchData();
  }, []);

  // Provide the context values to the children components
  return (
    <chatContext.Provider
      value={{
        isauthenticated,
        setisauthenticated,
        user,
        setuser,
        receiver,
        setreceiver,
        messageList,
        setmessageList,
        activeChat,
        setactiveChat,
        mychatList,
        setmychatList,
        originalChatList,
        fetchData,
        ipadd,
        socket,
        otherusertyping,
        setotherusertyping,
        ischatLoading,
        setischatLoading,
        otheruseronline,
        setotheruseronline,
        messageseen,
        setmessageseen,
        loading,
        setloading,
      }}
    >
      {props.children}
    </chatContext.Provider>
  );
};

// Export the ChatState component
export default ChatState;
