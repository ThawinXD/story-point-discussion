import { useEffect, useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Card from "./Card";


export default function CardHolder(
  { cards, canVote, onSelectCard, showEditCards, onChangeTextCard, updateCards }: { cards: string[]; canVote: boolean; onSelectCard: Function; showEditCards: boolean; onChangeTextCard: Function; updateCards?: Function }) {
  const [inCards, setCards] = useState<string[]>(cards);
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    })
  );

  useEffect(() => {
    console.log("Cards updated:");
    console.log(inCards);
  }, [inCards]);

  useEffect(() => {
    if (!canVote) {
      setSelectedCard("");
    }
  }, [canVote]);

  // keep local cards in sync when parent prop changes
  useEffect(() => {
    console.log("init cards", cards);
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
      const newOrder = arrayMove(cards, oldIndex, newIndex);
      return newOrder;
    })
    setActiveId(null);
  }

  function addCard() {
    if (showEditCards)
      setCards(prev => [...prev, Math.floor(Math.random() * 100).toString()]);
  }

  function deleteCard(card: string) {
    if (showEditCards) {
      setCards(prev => prev.filter(c => c !== card));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={inCards}
        strategy={horizontalListSortingStrategy}
        disabled={!showEditCards}
      >
        <div className="flex flex-row flex-wrap gap-4 justify-center">
          {
            inCards.map((c) => (
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
                onChangeTextCard={(newText: string) => onChangeTextCard(c, newText)}
                deleteCard={() => deleteCard(c)}
                isSelected={selectedCard === c}
              />
            ))
          }
          {showEditCards && (
            <div
              className="w-16 h-24 flex items-center justify-center rounded-lg outline-2 outline-green-400 outline-dashed relative hover:scale-105 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                addCard();
              }}
            >
              <span className="text-4xl font-bold text-green-400">+</span>
            </div>
          )}
          {showEditCards && (
            <div
              className="w-16 h-24 flex items-center justify-center rounded-lg outline-2 outline-blue-500 outline-dashed relative hover:scale-105 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                updateCards && updateCards(inCards);
              }}
            >
              <span className="text-4xl font-bold text-blue-500">✓</span>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}