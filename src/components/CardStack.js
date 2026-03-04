'use client';

export default function CardStack({ cards, maxCards = 5 }) {
    const cardsWithImages = cards.filter(c => c.image_url).slice(0, maxCards);
    if (cardsWithImages.length === 0) return null;

    return (
        <div className="card-stack-wrapper">
            <div className="card-stack">
                {cardsWithImages.map((card, i) => {
                    const total = cardsWithImages.length;
                    const mid = (total - 1) / 2;
                    const offset = i - mid;
                    const rotate = offset * 8;
                    const translateX = offset * 30;
                    const translateY = Math.abs(offset) * 6;
                    const zIndex = total - Math.abs(offset);

                    return (
                        <img
                            key={card.id}
                            src={card.image_url}
                            alt={`${card.bank_name} ${card.card_name}`}
                            className="card-stack-item"
                            style={{
                                transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
                                zIndex,
                            }}
                            loading="lazy"
                        />
                    );
                })}
            </div>
            {cards.length > maxCards && (
                <div className="card-stack-count">+{cards.length - maxCards} more</div>
            )}
        </div>
    );
}
