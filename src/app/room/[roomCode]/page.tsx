"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/app/contexts/userContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/socket";
import { Chat } from "@/components/Chat";
import { UserList } from "@/components/UserList";
import { Canvas } from "@/components/Canvas";

const RoomPage: React.FC = () => {
  const router = useRouter();
  const { roomCode } = useParams<{ roomCode: string }>();
  const { username } = useUser();
  const [users, setUsers] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<string>("");
  const [isDrawingAllowed, setIsDrawingAllowed] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (roomCode) {
      socket.emit("join-room", roomCode, username);
      socket.on("user-joined", (data) => {
        if (data.roomCode === roomCode) {
          console.log("user joined");
          fetchUsers();
        }
      });

      socket.on("user-left", (data) => {
        if (data.roomCode === roomCode) {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user !== data.username)
          );
        }
      });

      socket.on("drawer-assigned", (drawer) => {
        setDrawer(drawer);
        toast({
          title: "Game Started",
          description: `Drawer is ${drawer}`,
          duration: 8000,
        })
  
        if (drawer === username) {
          console.log("you are the drawer");
          setIsDrawingAllowed(true); 
        } else {
          setIsDrawingAllowed(false); 
        }
      });

      return () => {
        socket.emit("leave-room", roomCode, username);
        socket.off("user-joined");
        socket.off("user-left");
        setUsers([]);
      };
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/rooms/${roomCode}/users`
      );
      console.log(response.data.users);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`http://localhost:3000/rooms/${roomCode}/leave`, {
        username,
      });
      toast({
        title: "Goodbye",
        description: "You have left the room.",
      });
      router.push("/home");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleStartGame = async () => {
    try {
      const assignedDrawer = await axios.post(`http://localhost:3000/rooms/${roomCode}/assign-drawer`)
      socket.emit("drawer-assigned", roomCode, assignedDrawer.data.drawer);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-12 h-screen space-y-4 md:space-y-0">
      {/* Sidebar Section */}
      <div className="mx-auto w-full md:w-1/4 text-center mb-4 md:mb-0 bg-gray-100 p-4 rounded-md shadow-md">
        <h1 className="text-2xl font-semibold mb-4 md:mb-8">Room: {roomCode}</h1>
        <p className="mb-4 text-lg">Logged in as: <span className="font-semibold">{username}</span></p>
        <UserList users={users} drawer = {drawer}/>
        <Button onClick={handleStartGame} className="mt-2 w-full">Start Game</Button>
      </div>

      {/* Canvas Section */}
      <div className="flex-grow flex items-center justify-center bg-white p-4 rounded-md shadow-md">
        <Canvas roomCode={roomCode} isDrawingAllowed = {isDrawingAllowed}></Canvas>
      </div>

      {/* Chat Section */}
      <div className="mx-auto w-full md:w-1/4 text-center bg-gray-100 p-4 rounded-md shadow-md">
        <Chat
          roomCode={roomCode}
          user={username}
          leaveHandler={handleLeave}
        />
      </div>
    </div>
  );
};

export default RoomPage;
