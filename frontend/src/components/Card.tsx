"use client";

export default function Card(
  { card, canVote, isSelected, onSelectCard, showEditCards, deleteCard }: { card: string; canVote: boolean; isSelected: boolean; onSelectCard: Function; showEditCards: boolean; deleteCard: Function }
) {

  return (
    <div key={card} className={`w-16 h-24 flex items-center justify-center rounded-lg outline-2 outline-gray-400 relative
      ${(canVote || showEditCards) ? 'hover:scale-105 cursor-pointer rotate-y-0' : 'rotate-y-180'}
      ${isSelected ? 'scale-110 border-4 border-yellow-400' : ''}
      transform transition-all transform-3d`}
      onClick={() => onSelectCard()}>
      <div className="bg-white w-full h-full absolute top-0 left-0 flex items-center justify-center rounded-lg backface-hidden">
        <span className="text-2xl font-bold text-black">{card}</span>
        {showEditCards && (
          <div className="absolute -top-2 -right-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCard(card);
              }}
              className="cursor-pointer hover:scale-110 transition"
            >
              <span className="text-red-500 text-xs bg-red-100 rounded-full w-5 h-5 flex items-center justify-center">x</span>
            </button>
          </div>
        )}
      </div>
      <div className="bg-blue-500 backface-hidden w-full h-full absolute top-0 left-0 flex items-center justify-center rounded-lg rotate-y-180">
      </div>
    </div>
  )
}