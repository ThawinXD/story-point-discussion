
export default function Player({name, isVoted, cardPicked}: {name: string; isVoted: boolean; cardPicked: string | null}) {
  return (
    <p>{name} - {isVoted ? "Voted" : "Not Voted"} - {cardPicked || "No card picked"}</p>
  )
}