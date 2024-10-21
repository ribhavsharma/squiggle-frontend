import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NumberFlow from "@number-flow/react";

type Props = {
  users: string[];
  drawer: string;
};

export const UserList = (props: Props) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex flex-row">
            Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {props.users.map((user, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user}`}
                />
              </Avatar>
              <span>{user}</span>
              {user === props.drawer && (
                <span className="text-xs text-gray-500">(drawer)</span>
              )}
              <NumberFlow
                value={1000}
                format={{ notation: "compact" }} // Intl.NumberFormat options
                locales="en-US" // Intl.NumberFormat locales
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
