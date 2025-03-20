import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ setSelectedGroup }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
  }, []);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
  const token = userInfo.token;
  // Check admin status
  const checkAdminStatus = async () => {
    try {
      const { data } = await axios.get(
        `https://vv-chat-app-backend.onrender.com/api/users/${userInfo?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsAdmin(data.user?.isAdmin || false);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const { data } = await axios.get(
        "https://vv-chat-app-backend.onrender.com/api/groups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroups(data);

      // Get user groups
      const userGroupIds = data
        ?.filter((group) => {
          return group?.members?.some(
            (member) => member?._id === userInfo?._id
          );
        })
        .map((groups) => groups?._id);
      setUserGroups(userGroupIds);
    } catch (error) {
      console.log(error);
    }
  };

  // Create groups
  const handleCreateGroup = async () => {
    try {
      await axios.post(
        "https://vv-chat-app-backend.onrender.com/api/groups",
        {
          name: newGroupName,
          description: newGroupDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "Group created",
        status: "success",
        isClosable: true,
        duration: 3000,
      });
      setNewGroupName("");
      setNewGroupDescription("");
      onClose();
      fetchGroups();
    } catch (error) {
      toast({
        title: "Error creating group",
        status: "error",
        description: error.response.data.message || "An error occurred",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  // Join group
  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(
        `https://vv-chat-app-backend.onrender.com/api/groups/join/${groupId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchGroups();
      setSelectedGroup(groups.find((g) => g._id === groupId));
      toast({
        title: "Joined group successfully",
        status: "success",
        isClosable: true,
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Joining group",
        status: "error",
        description: error.response.data.message || "An error occurred",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  // Leave group
  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(
        `https://vv-chat-app-backend.onrender.com/api/groups/leave/${groupId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchGroups();
      setSelectedGroup(null);
      toast({
        title: "Leave group successfully",
        status: "success",
        isClosable: true,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error leaving group",
        status: "error",
        description: error.response.data.message || "An error occurred",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };
  return (
    <Box
      h="100%"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      width="300px"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <Flex
        p={4}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        position="sticky"
        top={0}
        zIndex={1}
        align="center"
        justify="space-between"
      >
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={onOpen}
              borderRadius="full"
            >
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      <Box flex="1" overflowY="auto" p={4} mb={16}>
        <VStack spacing={3} align="stretch">
          {groups.map((group) => (
            <Box
              key={group._id}
              p={4}
              cursor="pointer"
              borderRadius="lg"
              bg={userGroups.includes(group._id) ? "blue.50" : "gray.50"}
              borderWidth="1px"
              borderColor={
                userGroups.includes(group._id) ? "blue.200" : "gray.200"
              }
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                borderColor: "blue.300",
              }}
            >
              <Flex justify="space-between" align="center">
                <Box
                  flex="1"
                  onClick={() =>
                    userGroups.includes(group._id) && setSelectedGroup(group)
                  }
                >
                  <Flex align="center" mb={2}>
                    <Text fontWeight="bold" color="gray.800">
                      {group.name}
                    </Text>
                    {userGroups.includes(group._id) && (
                      <Badge ml={2} colorScheme="blue" variant="subtle">
                        Joined
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {group.description}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  colorScheme={userGroups.includes(group._id) ? "red" : "blue"}
                  variant={userGroups.includes(group._id) ? "ghost" : "solid"}
                  onClick={() => {
                    userGroups.includes(group._id)
                      ? handleLeaveGroup(group._id)
                      : handleJoinGroup(group._id);
                  }}
                  ml={3}
                  _hover={{
                    transform: group.isJoined ? "scale(1.05)" : "none",
                    bg: userGroups.includes(group._id) ? "red.50" : "blue.600",
                  }}
                  transition="all 0.2s"
                >
                  {userGroups.includes(group._id) ? (
                    <Text fontSize="sm" fontWeight="medium">
                      Leave
                    </Text>
                  ) : (
                    "Join"
                  )}
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
      <Box
        p={3}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        width="100%"
      >
        <Button
          p={6}
          variant="ghost"
          colorScheme="red"
          leftIcon={<Icon as={FiLogOut} />}
          onClick={handleLogout}
          width="100%"
          _hover={{
            bg: "red.50",
            transform: "translateY(-2px)",
            shadow: "md",
          }}
          transition="all 0.2s"
        >
          Logout
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                focusBorderColor="blue.400"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                focusBorderColor="blue.400"
              />
            </FormControl>
            <Button
              colorScheme="blue"
              mr={3}
              mt={4}
              width="full"
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
