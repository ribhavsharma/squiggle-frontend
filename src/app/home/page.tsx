"use client";

import React from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import { useUser } from "../contexts/userContext";

const formSchema = z.object({
  roomCode: z
    .string()
    .min(1, "Room code is required")
    .max(50, "Room code can't exceed 50 characters"),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {};

export const Page: React.FC<Props> = () => {
  const router = useRouter();
  const { username, setUsername } = useUser();

  const formMethods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomCode: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post("http://localhost:3000/rooms/create");
      const roomCode = response.data.room.roomCode;

      await axios.post("http://localhost:3000/rooms/join", {
        roomCode,
        username,
      });
      router.push(`/room/${roomCode}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create a room. Please try again later.");
    }
  };

  const onSubmit = async (data: FormSchema) => {
    try {
      await axios.post("http://localhost:3000/rooms/join", {
        roomCode: data.roomCode,
        username,
      });
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room. Please try again later.");
    }
    router.push(`/room/${data.roomCode}`);
  };

  const handleLogout = async () => {
    await axios.post("http://localhost:3000/users/delete", { username });
    setUsername("");
    router.push("/login");
  };

  return (
    <div className="container mx-auto p-8 w-[50%] text-center">
      <p>{username}</p>
      <h1 className="text-2xl font-semibold mb-8">Join or Create a Room</h1>

      <div className="mb-8">
        <Button variant="default" onClick={handleCreateRoom}>
          Create a Room
        </Button>
      </div>

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel htmlFor="roomCode">Enter Room Code to Join</FormLabel>
            <FormControl>
              <Input
                id="roomCode"
                type="text"
                placeholder="Enter room code"
                {...register("roomCode")}
              />
            </FormControl>
            {errors.roomCode && (
              <FormMessage>{errors.roomCode.message}</FormMessage>
            )}
          </FormItem>
          <Button type="submit" className="mt-4">
            Join Room
          </Button>
        </form>
      </FormProvider>

      <div className="mt-8">
        <Button variant="default" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Page;
