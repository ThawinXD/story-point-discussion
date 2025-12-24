"use client";
import Image from "next/image";
import { Button, TextField } from "@mui/material"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IResRoom, IUser } from "@/interfaces";
import { AppDispatch, useAppSelector } from "../lib/store";
import { useDispatch } from "react-redux";
import { setUserId, setUserName as setUserNameAction } from "../lib/features/user";
import socket from "../socket";

export default function Home() {
  const router = useRouter();
  const user: IUser = useAppSelector((state) => state.userSlice.user as IUser);
  const dispatch = useDispatch<AppDispatch>();
  const [userName, setUserName] = useState<string>("");
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);

  useEffect(() => {
    function onConnect() {
      setIsSocketConnected(true);
      if (socket.id)
        dispatch(setUserId(socket.id));
      console.log("Socket connected:", socket.id);
    }

    function onDisconnect() {
      setIsSocketConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userName)
        dispatch(setUserNameAction(userName));
    }, 500);

    return () => clearTimeout(timer);
  }, [userName, dispatch]);

  function submitName(e: string) {
    dispatch(setUserNameAction(e));
  }

  function handleCreateRoom() {
    console.log("Create room button clicked");
    socket.emit("createRoom", user, (res: IResRoom) => {
      if (res.success) {
        console.log("Room created with ID:", res.roomId);
        router.replace(`/room/#${res.roomId}`);
      } else {
        console.error("Error creating room:", res.error);
      }
    });
  }

  function handleJoinRoom() {
    console.log("Join room button clicked");
  }


  // useEffect(() => {
  //   console.log("Current user from global state:", user);
  // }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 m-8">
      <h1>Planning Poker Tool</h1>
      <p>
        Welcome to the Planning Poker Tool! Create a new room to start a planning poker session or join an existing room to participate with URL or room code.
      </p>
      <p>
        Enter your user name below to get started:
      </p>
      <form
        className="my-8"
        onSubmit={(e) => {
          e.preventDefault();
          submitName(userName);
        }}
      >
        <TextField
          variant="outlined"
          label="User Name"
          type="text"
          fullWidth
          margin="normal"
          sx={{
            '& .MuiInputBase-root': { backgroundColor: 'rgb(241 245 249)' },
          }}
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        />
      </form>
      <div className="my-8 flex flex-row">
        <Button
          variant="contained"
          onClick={(e) => {
            e.preventDefault();
            handleCreateRoom();
          }}
          disabled={userName.trim() === ""}
        >
          Create room
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => {
            e.preventDefault();
            handleJoinRoom();
          }}
          disabled={userName.trim() === ""}
        >
          Join room
        </Button>
      </div>
      <h1 className={isSocketConnected ? "text-green-500" : "text-red-500"}>
        {isSocketConnected ? "Socket Connected" : "Socket Disconnected"}
      </h1>
    </div>
  );
}
