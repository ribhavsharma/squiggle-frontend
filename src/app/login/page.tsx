"use client";

import React from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/app/contexts/userContext";

const formSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username can't exceed 50 characters"),
});

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { setUsername } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await axios.post("http://localhost:3000/users/create", data);
      console.log("user created successfully!");
      setUsername(data.username);

      toast({
        title: "Success!",
        description: "User created successfully.",
      });

      router.push("/home");
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto p-8 w-[25%]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormItem>
            <FormLabel htmlFor="username">Enter your name</FormLabel>
            <FormControl>
              <Input
                {...form.register("username")}
                id="username"
                type="text"
                placeholder="Name"
                required
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <Button type="submit" className="mt-4">
            Get started
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginPage;
