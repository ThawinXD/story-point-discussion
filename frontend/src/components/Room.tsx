"use client";

import { IEstimation, IResRoom, IRoom, IRoomUser, IUser, IVoteResult } from "@/interfaces";
import { useCallback, useEffect, useState } from "react";
import socket from "../socket";
import { Snackbar, Button } from "@mui/material";
import CardHolder from "./CardHolder";

export default function RoomPageIn({ user, roomId }: { user: IUser; roomId: string | null }) {
  const [host, setHost] = useState<string>("");
  const [cards, setCards] = useState<string[]>([]);
  const [users, setUsers] = useState<IRoomUser[]>([]);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [canVote, setCanVote] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [estimations, setEstimations] = useState<IEstimation[]>([]);
  const [voteResult, setVoteResult] = useState<[string, number][]>([]);
  const [selectCard, setSelectCard] = useState<string>("");
  const [showEditCards, setShowEditCards] = useState<boolean>(false);

  const getRoomData = useCallback(() => {
    console.log("Fetching room data for roomId:", roomId);
    if (!roomId) return;
    socket.emit("getRoomData", roomId, (res: { success: boolean; room?: IRoom; error?: string }) => {
      if (res.success && res.room) {
        setHost(res.room.host);
        setCards(res.room.cards);
        setUsers(res.room.users);
        setEstimations(res.room.estimations);
        setVoteResult(res.room.voteResult);
        setCanVote(res.room.canVote);
        setIsRevealed(res.room.revealed);
        // console.log("Room data updated:", res.room);
      } else {
        console.error("Error getting room data:", res.error);
      }
    });
  }, [roomId]);

  useEffect(() => {
    setTimeout(() => {
      if (roomId) getRoomData();
    }, 500);
  }, [roomId, getRoomData]);

  useEffect(() => {
    const onUserJoined = (data: IRoomUser) => {
      setSnackbarMessage(`User joined: ${data.name}`);
      setShowSnackbar(true);
      setUsers(prev => [...prev, data]);
    };
    const onUserLeft = (data: IRoomUser) => {
      setSnackbarMessage(`User left: ${data.name}`);
      setShowSnackbar(true);
      setUsers(prev => prev.filter(u => u.name !== data.name));
    };
    const onVoteStarted = () => {
      setSnackbarMessage("Vote started");
      setShowSnackbar(true);
      
      setUsers(prev => prev.map(u => ({ ...u, isVoted: false })));
      setEstimations([]);
      setVoteResult([]);
      setCanVote(true);
      setIsRevealed(false);
    };
    const onVoteReset = () => {
      setSnackbarMessage("Vote reset");
      setShowSnackbar(true);

      setCanVote(false);
      setIsRevealed(false);
      setUsers(prev => prev.map(u => ({ ...u, isVoted: false })));
      setEstimations([]);
      setVoteResult([]);
      setSelectCard("");
      setCanVote(false);
      setIsRevealed(false);
      setSelectCard("");
    };
    const onVoteReviewed = (estimations: IEstimation[]) => {
      setSnackbarMessage("Votes revealed");
      setShowSnackbar(true);

      setEstimations(estimations);
      setIsRevealed(true);
    };
    const onUserVoted = (user: IRoomUser) => {
      setUsers(prev => {
        return prev.map(u =>
          u.name === user.name ? { ...u, isVoted: true } : u
        );
      });
    };
    const onChangeVoted = (data: { user: IRoomUser; vote: string }) => {
      setUsers(prev => {
        return prev.map(u =>
          u.name === data.user.name ? { ...u, isVoted: true } : u
        );
      });
      setEstimations(prev => {
        const otherEstimations = prev.filter(e => e.name !== data.user.name);
        return [...otherEstimations, { name: data.user.name, vote: data.vote }];
      });
    };
    const onVoteResult = (voteResult: IVoteResult) => {
      setVoteResult(voteResult.votes);
    };


    // Guard against duplicated listeners in dev (Fast Refresh / StrictMode)
    if (process.env.NODE_ENV === "development") {
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("voteStarted");
      socket.off("voteReset");
      socket.off("voteReviewed");
      socket.off("userVoted");
      socket.off("changeVoted");
      socket.off("voteResult");
    }

    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);
    socket.on("voteStarted", onVoteStarted);
    socket.on("voteReset", onVoteReset);
    socket.on("voteReviewed", onVoteReviewed);
    socket.on("userVoted", onUserVoted);
    socket.on("changeVoted", onChangeVoted);
    socket.on("voteResult", onVoteResult);

    return () => {
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
      socket.off("voteStarted", onVoteStarted);
      socket.off("voteReset", onVoteReset);
      socket.off("voteReviewed", onVoteReviewed);
      socket.off("userVoted", onUserVoted);
      socket.off("changeVoted", onChangeVoted);
      socket.off("voteResult", onVoteResult);
    };
  }, []);

  function handleStartVote() {
    if (!roomId) return;
    if (host !== user.name) {
      alert("Only the host can start the vote.");
      return;
    }
    // Rely on the "voteStarted" event to refresh; avoid double getRoomData()
    socket.emit("startVote", { roomId, user }, (res: IResRoom) => {
      if (!res.success) {
        console.error("Error starting vote:", res.error);
      }
    });
  }

  function handleRevealCards() {
    if (!roomId) return;
    if (host !== user.name) {
      alert("Only the host can reveal the cards.");
      return;
    }
    socket.emit("revealVotes", { roomId, user }, (res: IResRoom) => {
      if (!res.success) {
        console.error("Error revealing cards:", res.error);
      }
    });
  }

  function handleResetVote() {
    if (!roomId) return;
    if (host !== user.name) {
      alert("Only the host can reset the vote.");
      return;
    }
    socket.emit("resetVote", { roomId, user }, (res: IResRoom) => {
      if (!res.success) {
        console.error("Error resetting vote:", res.error);
      }
    });
  }

  function handleVote(card: string) {
    if (!roomId) return;
    if (!canVote) {
      alert("Voting is not allowed at this time.");
      return;
    }
    socket.emit("vote", { roomId, user, vote: card }, (res: IResRoom) => {
      if (res.success) {
        setSelectCard(card);
        setEstimations(prev => {
          const otherEstimations = prev.filter(e => e.name !== user.name);
          return [...otherEstimations, { name: user.name, vote: card }];
        });
      } else {
        console.error("Error submitting vote:", res.error);
      }
    });
  }

  function handleEditCards() {
    console.log("Edit Cards button clicked");
    setShowEditCards(!showEditCards);
  }

  function deleteCard(card: string) {
    console.log("Delete card:", card);
    // Implement delete card logic here
  }

  return (
    <div>
      {showSnackbar && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={showSnackbar}
          onClose={() => setShowSnackbar(false)}
          message={snackbarMessage}
          key={"topcenter"}
        />
      )}
      <div>
        {roomId ? (
          <div>
            <p>Room ID: {roomId}</p>
            <p>Host: {host}</p>
            <p>Users: {users.map(u => u.name).join(", ")}</p>
            <p>Cards: {cards.join(", ")}</p>
            <p>Can Vote: {canVote ? "Yes" : "No"}</p>
            <p>Revealed: {isRevealed ? "Yes" : "No"}</p>
            <div>Estimations:</div>
            {estimations ? estimations.map(estimation => (
              <div key={estimation.name}>{estimation.name}: {estimation.vote}</div>
            )) : "No estimations yet"}
            <div>Result Card:</div>
            {voteResult ? voteResult.map(([vote, count], index) => (
              <div key={index}>{vote}: {count}</div>
            )) : "No results yet"}
          </div>
        ) : ""}
      </div>
      {user.name === host ?
        <div className="m-4">
          <div className="gap-4">
            <Button variant="contained" color="primary" onClick={handleStartVote} className="mr-2">
              Start Vote
            </Button>
            <Button variant="contained" color="secondary" onClick={handleRevealCards} className="mr-2">
              Reveal Cards
            </Button>
            <Button variant="outlined" onClick={handleResetVote}>
              Reset Vote
            </Button>
          </div>
          <div className="mt-4">
            <Button variant="contained" color="inherit" onClick={handleEditCards}>
              <p className="text-black">Edit Cards</p>
            </Button>
          </div>
        </div>
        : ""
      }
      <CardHolder
        card={cards}
        canVote={canVote}
        onSelectCard={(card: string) => {
          handleVote(card)
        }}
        showEditCards={showEditCards}
        deleteCard={(card: string) => {
          deleteCard(card);
        }}
      />
    </div>
  );
}