const cards = document.querySelectorAll('.card');
// เลือก element ทั้งหมดที่มี class "item"
const items = document.querySelectorAll('.item');
let draggedElement = null;

// วนลูปตรวจสอบแต่ละ item
items.forEach(item => {
    const resultElement = item.querySelector('.content p:nth-child(2)'); 
    if (resultElement.textContent.includes('PASSED')) {
        item.style.backgroundColor = 'lightgreen';
    } else if (resultElement.textContent.includes('FAILED')) {
        item.style.backgroundColor = 'lightcoral';
    } else {
        item.style.backgroundColor = 'orange';
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
    //  setTimeout(() => {
    //  e.target.classList.add('hide');
    //  }, 0);
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
  
  // สร้าง Map เพื่อเก็บ item ของแต่ละ card
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
      
      // เรียง item ตาม itemId ที่บันทึกไว้
      const items = cardItemsMap.get(cardId);
      items.sort((a, b) => {
        const aIndex = itemPositions.indexOf(parseInt(a.dataset.itemId, 10));
        const bIndex = itemPositions.indexOf(parseInt(b.dataset.itemId, 10));
        return aIndex - bIndex;
      });
      
      items.forEach(item => card.appendChild(item)); // จัดเรียง item ใหม่
    }
  });
}

  document.addEventListener('DOMContentLoaded', () => {
    loadCardPositions();
    fetch('/get_urls/')
        .then(response => response.json())
        .then(urls => {
            const sourceLinks = document.querySelectorAll('.source-link');
            sourceLinks.forEach(link => {
                link.addEventListener('click', event => {
                    event.preventDefault();
                    const source = link.dataset.source;
                    if (urls[source]) {
                        window.location.href = urls[source];
                    } else {
                        alert('URL not found for ' + source);
                    }
                });
            });
        })
        .catch(error => console.error('Error fetching URLs:', error));
  });

  function drop(e) {
    e.preventDefault();
    e.stopPropagation();
  
    const targetCard = e.target.closest('.card');
  
    if (draggedElement !== targetCard && draggedElement.classList.contains('item')) { // ตรวจสอบว่าลาก item
      targetCard.appendChild(draggedElement); // ย้าย item ไปยัง card ปลายทาง
  
      // อัปเดต itemPositions ใน card ที่ถูกลากและ card ปลายทาง
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


    // เรียกใช้ saveCardPositions เพื่อบันทึกตำแหน่งใหม่
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