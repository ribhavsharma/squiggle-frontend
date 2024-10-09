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

const RoomPage: React.FC = () => {
  const router = useRouter();
  const { roomCode } = useParams<{ roomCode: string }>();
  const { username } = useUser();
  const [users, setUsers] = useState<string[]>([]);
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

  return (
    <div className="flex p-12 h-[100%]">
      <div className="mx-auto w-[30%] text-center">
        <h1 className="text-2xl font-semibold mb-8">Room: {roomCode}</h1>
        <p>Logged in as: {username}</p>
        <UserList users={users}></UserList>
      </div>
      <div className="w-[70%] h-full">
        <Chat
          roomCode={roomCode}
          user={username}
          leaveHandler={handleLeave}
        ></Chat>
      </div>
    </div>
  );
};

export default RoomPage;
