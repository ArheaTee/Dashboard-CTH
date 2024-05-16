const container = document.querySelector('.container');
let eventSource; 

// สร้าง EventSource เพียงครั้งเดียวเมื่อโหลดหน้าเว็บ
window.addEventListener('load', () => {
    eventSource = new EventSource("/stream");
    eventSource.onmessage = updateData; // เรียกใช้ updateData เมื่อมีข้อมูลใหม่
});

container.addEventListener('dragstart', dragStart);
container.addEventListener('dragover', dragOver);
container.addEventListener('drop', drop);

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);
    const dropzone = e.target;
    dropzone.parentNode.insertBefore(draggableElement, dropzone);
    draggableElement.classList.remove('hide');
   // บันทึกลำดับการเรียงใหม่ใน localStorage
    const cardOrder = Array.from(container.children).map(card => card.querySelector('h2').textContent);
    localStorage.setItem('cardOrder', JSON.stringify(cardOrder));

   // อัปเดตข้อมูลในหน้าเว็บหลังจากลากวาง
    updateData();
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลในหน้าเว็บ
function updateData() {
    const data = JSON.parse(eventSource.lastEventId); 
    container.innerHTML = ''; 

    const sortedData = {};
    const cardOrder = JSON.parse(localStorage.getItem('cardOrder')) || []; 
    cardOrder.forEach(source => {
        if (data.hasOwnProperty(source)) {
            sortedData[source] = data[source];
        }
    });

    for (const source in sortedData) {
        const card = document.createElement('div');
        card.classList.add('card', 'draggable');

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        cardHeader.innerHTML = `<h2>${source}</h2>`;
        card.appendChild(cardHeader);

        const card2 = document.createElement('div');  // สร้าง card2
        card2.classList.add('card2');
        card.appendChild(card2);

        for (const station of sortedData[source]) {
            const item = document.createElement('div');
            item.classList.add('item');
            item.innerHTML = `
                <div class="id">${station.id}</div>
                <div class="content">
                    <p>Station Name: ${station.station_name}</p>
                    <p>Result: ${station.result}</p>
                    <p>Timestamp: ${station.timestamp}</p>
                    <p>Elapsed Seconds: ${station.elapsed_seconds}</p>
                </div>
            `;
            card2.appendChild(item); // เพิ่ม item ลงใน card2
        }

        container.appendChild(card); 
    }
}

// เรียกใช้ฟังก์ชัน updateData เมื่อโหลดหน้าเว็บครั้งแรก
window.addEventListener('load', updateData);
