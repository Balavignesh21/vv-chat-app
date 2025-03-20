import { Box, Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import io from "socket.io-client";
const ENDPOINT = "https://vv-chat-app-backend.onrender.com";

function Chat() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
    const newSocket = io(ENDPOINT, {
      auth: { user: userInfo },
    });
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <Flex h="100vh">
      <Box>
        <Sidebar
          setSelectedGroup={setSelectedGroup}
          selectedGroup={selectedGroup}
        />
      </Box>
      <Box flex={1}>
        {socket && <ChatArea selectedGroup={selectedGroup} socket={socket} />}
      </Box>
    </Flex>
  );
}

export default Chat;
