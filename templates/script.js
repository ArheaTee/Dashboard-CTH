const cards = document.querySelectorAll('.card');
const items = document.querySelectorAll('.item');
let draggedElement = null;

document.querySelectorAll('.toggle-button').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.card');
        const cardContent = card.querySelector('.card-content');
        const summaryElement = card.querySelector('.summary');
        const items = card.querySelectorAll('.item');
        let passCount = 0;
        let failCount = 0;
        let abortCount = 0;
        let testCount = 0;

        items.forEach(item => {
            const resultElement = item.querySelector('.content p:nth-child(2)');
            if (resultElement.textContent.includes('PASSED')) {
                passCount++;
            } 
            else if (resultElement.textContent.includes('FAILED')) {
                failCount++;
            }
            else if (resultElement.textContent.includes('ABORTED')) {
                abortCount++;
            }
            else {
                testCount++;
            }
        });

        summaryElement.textContent = `PASS: ${passCount}, FAIL: ${failCount}, ABORT: ${abortCount}, TEST: ${testCount}`;
        cardContent.classList.toggle('collapsed');
        button.textContent = cardContent.classList.contains('collapsed') ? '+' : '-';
    });
});

items.forEach(item => {
    const productname = item.querySelector('.content p:nth-child(1)');
    const resultElement = item.querySelector('.content p:nth-child(2)');

    if (!productname.textContent.trim() || productname.textContent.trim() === "Station Name:") {
        item.style.backgroundColor = 'white';
        productname.textContent = "Station Name: offline";
    } else {
        if (resultElement.textContent.includes('PASSED')) {
            item.style.backgroundColor = 'lightgreen';
        } else if (resultElement.textContent.includes('FAILED')) {
            item.style.backgroundColor = 'lightcoral';
        } else if (resultElement.textContent.includes('ABORTED')) {
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
            itemPositions.push(parseInt(item.dataset.itemId));
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

function fetchData() {
    const family = document.getElementById("family-select").value;
    fetch(`/realtime_data?family=${family}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById("data-container").innerHTML = renderCards(data.stations);
      });
}

function renderCards(stations) {
  let html = '';
  for (const [group, stationData] of Object.entries(stations)) {
    for (const [source, items] of Object.entries(stationData)) {
      const url = truncateUrl(items[0].url);
      const isOffline = !items || items.length === 0;

      html += `
        <div class="card" draggable="true" data-card-id="${source}">
          <div class="card-header">
            <h2>${source}</h2>
            <p>URL : <a href="${url}" target="_blank">${url}</a></p>
            <p class="summary"></p>
          </div>
          <div class="card-content">
            ${isOffline ? `
              <div class="item" style="background-color: white;">
                <div class="content">
                  <p>Station Name: offline</p>
                  <p>Result: offline</p>
                  <p>Test time: offline</p>
                </div>
              </div>` :
              items.map(item => `
                <div class="item" data-item-id="${item.id}" style="background-color: ${getColor(item.result)};">
                  <div class="id">${item.id}</div>
                  <div class="content">
                    <p>Station Name: ${item.station_name}</p>
                    <p>Result: ${item.result}</p>
                    <p>Test time: ${item.display}</p>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      `;
    }
  }
  return html;
}

function truncateUrl(url) {
  return url.replace('get_all_process_stations_ui/', '');
}

function getColor(result) {
  switch(result) {
    case 'PASSED': return 'lightgreen';
    case 'FAILED': return 'lightcoral';
    case 'ABORTED': return 'lightblue';
    default: return 'orange';
  }
}
