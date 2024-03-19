import "./App.css";
import { useColorMode } from "@chakra-ui/react";
import Navbar from "./components/Navbar/Navbar";
import ChatState from "./context/chatState";
import { useContext } from "react";
import chatContext from "./context/chatContext";

function App(props) {
  const { colorMode, toggleColorMode } = useColorMode();
  const context = useContext(chatContext);

  // localStorage.removeItem("token")

  return (
    <ChatState>
      <div className="App">
        <Navbar toggleColorMode={toggleColorMode} context={context} />
      </div>
    </ChatState>
  );
}

export default App;
