import { IEstimation, IRoomUser, IUser, IVoteResult } from "@/interfaces";
import Player from "./Player";
import { Button } from "@mui/material";
import PlayerCard from "./playerCard";


export default function Table(
  { users, estimations, canVote, isRevealed, showEditCards, voteResult, host, user, onStartVote, onRevealCards, onResetVote, onEditCards }: { users: IRoomUser[]; estimations: IEstimation[]; canVote: boolean; isRevealed: boolean; showEditCards: boolean; voteResult: IVoteResult | null; host: string; user: IUser; onStartVote: Function; onRevealCards: Function; onResetVote: Function; onEditCards: Function }
) {
  const total = users.length;
  const width = 600;
  const height = 300;
  const radius = height / 2;
  const line = width - 2 * radius;
  const perimeter = 2 * line + 2 * Math.PI * radius;
  const gap = 45; // gap between circle and players

  return (
    <div className="flex items-center justify-center p-8 mt-8 mb-10">
      <div
        className="relative rounded-full m-4 bg-blue-400 self-center mb-4 flex items-center justify-center"
        style={{
          width: width,
          height: height,
        }}
      >
        {
          host === user.name &&
          <div className="flex flex-col gap-4">
            {
              !canVote && !showEditCards &&
              <Button variant="contained" color="primary" onClick={() => onStartVote()} className="mr-2">
                Start Vote
              </Button>
            }
            {
              canVote && !isRevealed && !showEditCards &&
              <Button variant="contained" color="secondary" onClick={() => onRevealCards()} className="mr-2">
                Reveal Cards
              </Button>
            }
            {
              canVote && isRevealed && !showEditCards &&
              <Button variant="outlined" onClick={() => onResetVote()} sx={{ color: 'white', borderColor: 'white' }}>
                Reset Vote
              </Button>
            }
            {!showEditCards && !canVote && !isRevealed &&
              <Button variant="contained" color="inherit" onClick={() => onEditCards()}>
                <p className="text-black">Edit Cards</p>
              </Button>
            }
          </div>
        }
        {
          users.map((u, index) => {
            const userEstimation = estimations ? estimations.find(e => e.name === u.name) : null;
            const cardPicked = userEstimation ? userEstimation.vote : null;
            let step = ((index + 1) * (perimeter / total) + (line / 2)) % perimeter;

            let px = 0;
            let py = 0;

            let cx = 0;
            let cy = 0;

            let condition = false;

            if (step <= line) {
              // Top side
              condition = true;
              const x = -line / 2 + step;
              const y = -radius;
              px = x;
              py = y - gap;
              cx = x;
              cy = y + gap;
            }

            if (!condition) step -= line;
            if (!condition && step < Math.PI * radius) {
              // Right curve
              condition = true;
              const angle = -Math.PI / 2 + step / radius;
              const x = line / 2 + radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              px = x + Math.cos(angle) * gap;
              py = y + Math.sin(angle) * gap;
              cx = x - Math.cos(angle) * gap;
              cy = y - Math.sin(angle) * gap;
            }

            if (!condition) step -= Math.PI * radius
            if (!condition && step <= line) {
              // Bottom side
              condition = true;
              const x = line / 2 - step;
              const y = radius;
              px = x;
              py = y + gap;
              cx = x;
              cy = y - gap;
            }

            if (!condition) step -= line;
            if (!condition) {
              // Left curve
              const angle = Math.PI / 2 + step / radius;
              const x = -line / 2 + radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              px = x + Math.cos(angle) * gap;
              py = y + Math.sin(angle) * gap;
              cx = x - Math.cos(angle) * gap;
              cy = y - Math.sin(angle) * gap;
            }

            return (
              <>
                <Player
                  key={u.name}
                  name={u.name}
                  isVoted={u.isVoted}
                  cardPicked={isRevealed ? cardPicked : null}
                  x={px}
                  y={py}
                />
                <PlayerCard
                  key={`card-${u.name}`}
                  x={cx}
                  y={cy}
                  isVoted={u.isVoted}
                  cardPicked={isRevealed ? cardPicked : null}
                />
              </>
            )
          })
        }
      </div>
    </div>
  )
}