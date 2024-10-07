"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/app/contexts/userContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/socket";

const RoomPage: React.FC = () => {
  const router = useRouter();
  const { roomCode } = useParams();
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
    <div className="container mx-auto p-8 w-[50%] text-center">
      <h1 className="text-2xl font-semibold mb-8">Room: {roomCode}</h1>
      <p>Logged in as: {username}</p>
      <h2 className="text-xl font-semibold mb-4">Users in this room:</h2>
      {users.length > 0 ? (
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      ) : (
        <p>No users in this room.</p>
      )}
      <Button onClick={handleLeave}>Leave</Button>
    </div>
  );
};

export default RoomPage;
