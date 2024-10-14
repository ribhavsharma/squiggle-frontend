"use client";

import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import { Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

type ChatProps = {
  roomCode: string;
  user: string;
  leaveHandler: () => void;
};

type Message = {
  message: string;
  timestamp: Date;
  username: string;
};

export function Chat({ roomCode, user, leaveHandler }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("message", (messageData: Message) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("chatMessage", {
        message: input,
        timestamp: new Date(),
        roomCode: roomCode,
        username: user,
      });
      setInput("");
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold w-[50%]">Chat</CardTitle>
        <Button
          onClick={leaveHandler}
          size="icon"
          className="bg-transparent hover:bg-transparent p-0 focus:ring-0"
        >
          <LogOut className="h-6 w-6" color="#DE6D6D" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow overflow-hidden">
        {/* Chat Messages Scrollable Area */}
        <ScrollArea className="flex-grow pr-4 mb-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 mb-4 ${
                message.username === user ? "justify-end" : "justify-start"
              }`}
            >
              {message.username !== user && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.username}`}
                  />
                  <AvatarFallback>
                    {message.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 min-w-[20%] ${
                  message.username === user
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">
                    {message.username}
                  </span>
                  <p className="mt-1">{message.message}</p>
                  <span className="text-xs opacity-70 mt-2 self-end">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {message.username === user && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`}
                  />
                  <AvatarFallback>{user[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </ScrollArea>

        {/* Input Section */}
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-grow"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
