import { useEffect, useState } from "react";
import Card from "./Card";


export default function CardHolder(
  { card, canVote, onSelectCard, showEditCards, deleteCard }: { card: string[]; canVote: boolean; onSelectCard: Function; showEditCards: boolean; deleteCard: Function })
{
  const [selectedCard, setSelectedCard] = useState<string>("");

  useEffect(() => {
    if (!canVote) {
      setSelectedCard("");
    }
  }, [canVote]);
  
  return (
    <div className="flex flex-row flex-wrap gap-4 justify-center">
      {card.map((c) => (
        <Card
          key={c}
          card = {c}
          canVote={canVote}
          isSelected={selectedCard === c}
          onSelectCard={() => {
            if (!canVote) return;
            setSelectedCard(c);
            onSelectCard(c);
          }}
          showEditCards={showEditCards}
          deleteCard={() => deleteCard(c)}
        />
      ))}
    </div>
  )
}