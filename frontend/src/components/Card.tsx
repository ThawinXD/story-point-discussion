"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";

export default function Card(
  { card, canVote, isSelected, onSelectCard, showEditCards, deleteCard, onChangeTextCard }: { card: string; canVote: boolean; isSelected: boolean; onSelectCard: Function; showEditCards: boolean; deleteCard: Function; onChangeTextCard: Function }
) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: card});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  const [text, settext] = useState<string>(card);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== card) {
        onChangeTextCard(text);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text, card, onChangeTextCard]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-16 h-24 flex items-center justify-center rounded-lg outline-2 outline-gray-400 relative
      ${(canVote || showEditCards) ? 'hover:scale-105 cursor-pointer rotate-y-0' : 'rotate-y-180'}
      ${isSelected ? 'scale-110 border-4 border-yellow-400' : ''}
      transform transition-all transform-3d`}
      onClick={(e) => {
        e.preventDefault();
        if (!canVote) return;
        onSelectCard(card)}
      }>
      <div className="bg-white w-full h-full absolute top-0 left-0 flex items-center justify-center rounded-lg backface-hidden">
        {showEditCards ? (
          <input
            type="text"
            value={text}
            className="text-2xl font-bold text-black text-center outline-none w-full"
            onChange={(e) => {
              e.defaultPrevented;
              settext(e.target.value)
            }}
            onSubmit={(e) => {
              e.defaultPrevented;
              onChangeTextCard(text)
            }}
          />
        ): (
          <span className="text-2xl font-bold text-black">{card}</span>
        )}
        {showEditCards && (
          <div className="absolute -top-2 -right-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCard(card);
              }}
              className="cursor-pointer hover:scale-110 transition"
            >
              <span className="text-white text-xs bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">x</span>
            </button>
          </div>
        )}
      </div>
      <div className="bg-blue-500 backface-hidden w-full h-full absolute top-0 left-0 flex items-center justify-center rounded-lg rotate-y-180">
      </div>
    </div>
  )
}