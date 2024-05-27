const cards = document.querySelectorAll('.card');
const items = document.querySelectorAll('.item');
let draggedElement = null;

items.forEach(item => {
    const productname = item.querySelector('.content p:nth-child(1)'); // Station Name
    const resultElement = item.querySelector('.content p:nth-child(2)'); // Result

    // ตรวจสอบว่า productname มีข้อความหรือไม่
    if (!productname.textContent.trim() || productname.textContent.trim() === "Station Name:") {
        item.style.backgroundColor = 'white';
        productname.textContent = "Station Name: offline";
    } else {
        if (resultElement.textContent.includes('PASSED')) {
            item.style.backgroundColor = 'lightgreen';
        } else if (resultElement.textContent.includes('FAILED')) {
            item.style.backgroundColor = 'lightcoral';
        } else if (resultElement.textContent.includes('ABOARD')) {
            item.style.backgroundColor = 'lightblue';
        } else {
            item.style.backgroundColor = 'orange';
        }
    }
});

cards.forEach(card => {
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragover', dragOver);
    card.addEventListener('drop', drop);
    card.addEventListener('dragenter', dragEnter);
    card.addEventListener('dragleave', dragLeave);
});

function dragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
    e.preventDefault();
}

function saveCardPositions() {
    const cardPositions = [];
    const allCards = document.querySelectorAll('.card');

    allCards.forEach(card => {
        const cardId = card.dataset.cardId;
        const itemPositions = [];

        card.querySelectorAll('.item').forEach(item => {
            itemPositions.push(parseInt(item.dataset.itemId)); // ใช้ itemId แทน itemIndex
        });

        cardPositions.push({ cardId, itemPositions });
    });

    localStorage.setItem('cardPositions', JSON.stringify(cardPositions));
}

function loadCardPositions() {
    const cardPositions = JSON.parse(localStorage.getItem('cardPositions')) || [];
    const container = document.querySelector('.container');

    const cardItemsMap = new Map();
    cardPositions.forEach(({ cardId, itemPositions }) => {
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (card) {
            cardItemsMap.set(cardId, Array.from(card.querySelectorAll('.item')));
        }
    });

    cardPositions.forEach(({ cardId, itemPositions }) => {
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (card) {
            container.appendChild(card);

            const items = cardItemsMap.get(cardId);
            items.sort((a, b) => {
                const aIndex = itemPositions.indexOf(parseInt(a.dataset.itemId, 10));
                const bIndex = itemPositions.indexOf(parseInt(b.dataset.itemId, 10));
                return aIndex - bIndex;
            });

            items.forEach(item => card.appendChild(item));
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCardPositions();
});

function drop(e) {
    e.preventDefault();
    e.stopPropagation();

    const targetCard = e.target.closest('.card');

    if (draggedElement !== targetCard && draggedElement.classList.contains('item')) {
        targetCard.appendChild(draggedElement);

        const originalCard = draggedElement.parentNode;
        const originalCardId = originalCard.dataset.cardId;
        const targetCardId = targetCard.dataset.cardId;

        const cardPositions = JSON.parse(localStorage.getItem('cardPositions')) || [];

        cardPositions.forEach(cardPosition => {
            if (cardPosition.cardId === originalCardId || cardPosition.cardId === targetCardId) {
                cardPosition.itemPositions = Array.from(document.querySelector(`[data-card-id="${cardPosition.cardId}"]`).querySelectorAll('.item')).map(item => parseInt(item.dataset.itemId, 10));
            }
        });

        localStorage.setItem('cardPositions', JSON.stringify(cardPositions));
    } else if (draggedElement !== targetCard && draggedElement.classList.contains('card')) {
        const allCards = [...document.querySelectorAll('.card')];
        const draggedIndex = allCards.indexOf(draggedElement);
        const targetIndex = allCards.indexOf(targetCard);

        if (draggedIndex > targetIndex) {
            targetCard.parentNode.insertBefore(draggedElement, targetCard);
        } else {
            targetCard.parentNode.insertBefore(draggedElement, targetCard.nextSibling);
        }
    }

    saveCardPositions();

    draggedElement.classList.remove('hide');
    draggedElement = null;
}

function dragEnter(e) {
    e.preventDefault();
    const targetCard = e.target.closest('.card');
    if (targetCard) {
        targetCard.classList.add('drag-over');
    }
}

function dragLeave(e) {
    const targetCard = e.target.closest('.card');
    if (targetCard) {
        targetCard.classList.remove('drag-over');
    }
}
