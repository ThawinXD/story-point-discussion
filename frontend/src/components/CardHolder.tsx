import { useEffect, useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Card from "./Card";


export default function CardHolder(
  { cards, canVote, onSelectCard, showEditCards, deleteCard }: { cards: string[]; canVote: boolean; onSelectCard: Function; showEditCards: boolean; deleteCard: Function }) {
  const [inCards, setCards] = useState<string[]>(cards);
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    console.log(inCards);
  }, [inCards]);

  useEffect(() => {
    if (!canVote) {
      setSelectedCard("");
    }
  }, [canVote]);

  // keep local cards in sync when parent prop changes
  useEffect(() => {
    setCards(cards);
  }, [cards]);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    if (active.id === over.id) return;

    setCards((cards) => {
      const oldIndex = cards.indexOf(active.id as string);
      const newIndex = cards.indexOf(over.id as string);
      return arrayMove(cards, oldIndex, newIndex);
    })
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards}
        strategy={horizontalListSortingStrategy}
        disabled={!showEditCards}
      >
        <div className="flex flex-row flex-wrap gap-4 justify-center">
          {
            cards.map((c) => (
              <Card
                card={c}
                key={c}
                canVote={canVote}
                onSelectCard={() => {
                  if (!canVote) return;
                  setSelectedCard(c);
                  onSelectCard(c);
                }}
                showEditCards={showEditCards}
                deleteCard={() => deleteCard(c)}
                isSelected={selectedCard === c}
              />
            ))
          }
        </div>
      </SortableContext>
    </DndContext>
  )
}