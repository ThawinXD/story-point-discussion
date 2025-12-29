import { IEstimation, IRoomUser, IUser } from "@/interfaces";
import Players from "./Player";
import Player from "./Player";


export default function Table(
  { users, estimations, isRevealed, voteResult, host, user }: { users: IRoomUser[]; estimations: IEstimation[]; isRevealed: boolean; voteResult: [string, number][]; host: string; user: IUser }
) {

  return (
    <div>
      {
        users.map((u) => {
          const userEstimation = estimations.find(e => e.name === u.name);
          const cardPicked = userEstimation ? userEstimation.vote : null;
          return (
            // <div key={u.name} style={{ fontWeight: u.name === host ? "bold" : "normal", backgroundColor: u.name === user.name ? "#e0e0e0" : "transparent", padding: "5px", margin: "5px", borderRadius: "5px" }}>
            //   <p>{u.name} - {u.isVoted ? "Voted" : "Not Voted"} - {isRevealed ? (cardPicked || "No card picked") : (u.isVoted ? "Card picked" : "No card picked")}</p>
            // </div>
            <Player
              key={u.name}
              name={u.name}
              isVoted={u.isVoted}
              cardPicked={isRevealed ? cardPicked : null}
            />
          )
        })
      }
    </div>
  )
}