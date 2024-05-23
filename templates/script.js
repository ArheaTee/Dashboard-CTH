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
 setTimeout(() => {
 e.target.classList.add('hide');
 }, 0);
}

function dragOver(e) {
 e.preventDefault();
}

function drop(e) {
 e.preventDefault();
 e.stopPropagation();

 const targetCard = e.target.closest('.card');
 if (draggedElement !== targetCard) {
 const allCards = [...document.querySelectorAll('.card')];
 const draggedIndex = allCards.indexOf(draggedElement);
 const targetIndex = allCards.indexOf(targetCard);

 if (draggedIndex > targetIndex) {
 targetCard.parentNode.insertBefore(draggedElement, targetCard);
 } else {
 targetCard.parentNode.insertBefore(draggedElement, targetCard.nextSibling);
 }
 }
 
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