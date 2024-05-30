# Dashboard-CTH
จากข้อมูลที่ได้รับจากไฟล์ต่างๆ เราสามารถสรุปวิธีการทำงานและโครงสร้างของโปรเจ็คนี้ได้ดังนี้:

### สรุปวิธีการทำงานของโปรเจ็ค

1. **โครงสร้างของหน้าเว็บ**
   - **index.html**: เป็นหน้าแรกที่มีการแสดง Layout ของห้องเทสที่สามารถคลิกเพื่อไปยังหน้า RealTime ได้
   - **realtime.html**: เป็นหน้าที่แสดงข้อมูลเรียลไทม์ของสถานีต่างๆ ในรูปแบบการ์ด (cards) โดยแต่ละการ์ดจะแสดงข้อมูลสถานีและผลการทดสอบ
   - **history.html**: เป็นหน้าที่แสดงข้อมูลประวัติการทดสอบ ซึ่งดึงข้อมูลมาจาก MongoDB
   - **style.css**: เป็นไฟล์ CSS สำหรับสไตล์และการจัดวางองค์ประกอบของหน้าเว็บ
   - **script.js**: เป็นไฟล์ JavaScript สำหรับจัดการการทำงานของฟังก์ชันลากและวาง (drag and drop) และการเปลี่ยนสีของการ์ดตามผลลัพธ์

2. **การแสดงผลและการโต้ตอบ**
   - ใน `realtime.html`, ข้อมูลของสถานีทดสอบจะแสดงในรูปแบบการ์ดที่สามารถลากและวางได้โดยใช้ฟังก์ชัน drag and drop ที่จัดการโดย JavaScript
   - มีปุ่มสำหรับซ่อน/แสดงรายละเอียดของการ์ดและแสดงสรุปผลการทดสอบของแต่ละสถานี
   - ในแต่ละการ์ด รายการที่แสดงผลการทดสอบจะถูกเปลี่ยนสีตามผลลัพธ์ เช่น สีเขียวสำหรับ `PASSED`, สีแดงสำหรับ `FAILED`, สีฟ้าสำหรับ `ABORTED`, และสีส้มสำหรับสถานะอื่นๆ

3. **การจัดการข้อมูล**
   - ข้อมูลเรียลไทม์ดึงมาจาก API และแสดงในหน้า RealTime
   - ข้อมูลประวัติการทดสอบถูกดึงมาจาก MongoDB และแสดงในหน้า History

4. **การจัดการตำแหน่งการ์ด**
   - ตำแหน่งของการ์ดและรายการทดสอบถูกบันทึกใน Local Storage เพื่อให้ข้อมูลคงอยู่หลังจากรีเฟรชหน้าเว็บ
   - ฟังก์ชันใน `script.js` ถูกใช้เพื่อบันทึกและโหลดตำแหน่งของการ์ดและรายการทดสอบ

### โครงสร้างของไฟล์
1. **index.html**:
   - แสดง Layout ของห้องเทสที่สามารถคลิกเพื่อไปยังหน้า RealTime
   - มี Navigation Bar ที่สามารถนำทางไปยังหน้า RealTime และหน้า History
   ```html
   <div class="navbar">
     <a href="/">Home</a>
     <a href="/realtime">RealTime</a>
     <div class="dropdown">
       <button class="dropbtn" onclick="myFunction()">Dropdown
         <i class="fa fa-caret-down"></i>
       </button>
       <div class="dropdown-content" id="myDropdown">
         <a href="/history">History</a>
       </div>
     </div>
   </div>
   <div class="container">
     <a href="/realtime">
       <img src="{{ url_for('static', filename='Layout-room.png') }}" alt="Room Layout" class="layout-img">
     </a>
   </div>
   ```

2. **realtime.html**:
   - แสดงข้อมูลเรียลไทม์ในรูปแบบการ์ด
   - การ์ดสามารถลากและวางได้ และเปลี่ยนสีตามผลลัพธ์
   ```html
   <div class="container">
       {% for source, stations in data.items() %}
       <div class="card" draggable="true" data-card-id="{{ source }}">
           <div class="card-header">
               <h2>{{ source }}</h2>
               <p>URL : <a href="{{ urls_data[source] | remove_suffix }}" target="_blank">{{ urls_data[source] | remove_suffix }}</a></p>
               <p class="summary"></p>
           </div>
           <div class="card-content">
               {% for station in stations %}
               <div class="item" data-item-id="{{ station.id }}">
                   <div class="id">{{ station.id }}</div>
                   <div class="content">
                       <p>Station Name: {{ station.station_name }}</p>
                       <p>Result: {{ station.result }}</p>
                       <p>Test time: {{ station.display }}</p>
                   </div>
               </div>
               {% endfor %}
           </div>
       </div>
       {% endfor %}
   </div>
   ```

3. **history.html**:
   - แสดงข้อมูลประวัติการทดสอบ
   - มี Navigation Bar ที่สามารถนำทางไปยังหน้าอื่น ๆ ได้
   ```html
   <div class="navbar">
     <a href="/">Home</a>
     <a href="/realtime">RealTime</a>
     <div class="dropdown">
       <button class="dropbtn" onclick="myFunction()">Dropdown
         <i class="fa fa-caret-down"></i>
       </button>
       <div class="dropdown-content" id="myDropdown">
         <a href="/history">History</a>
       </div>
     </div>
   </div>
   <h1>History</h1>
   <button onclick="document.location='index.html'">Home</button>
   ```

4. **style.css**:
   - กำหนดสไตล์ขององค์ประกอบต่าง ๆ บนหน้าเว็บ เช่น การจัดวางการ์ด, สีของการ์ดตามผลลัพธ์, และการแสดงผลของ Navigation Bar
   ```css
   .card {
       border: 1px solid #ccc;
       padding: 10px;
       border-radius: 5px;
       background-color: white;
       cursor: grab;
       width: 300px;
       box-shadow: 0 2px 5px rgba(0,0,0,0.1);
   }

   .card .item {
       border-bottom: 1px solid #eee;
       padding: 10px 0;
   }

   .card .item:last-child {
       border-bottom: none;
   }

   .card .item .id {
       font-weight: bold;
       margin-bottom: 5px;
       display: inline-block;
       width: 20px;
       text-align: center;
   }

   .card .item .content p {
       margin: 5px 0;
       font-size: 14px;
       color: #555;
   }

   .card-content.collapsed .item {
       display: none;
   }
   ```

5. **script.js**:
   - จัดการฟังก์ชันการลากและวางการ์ด (drag and drop)
   - จัดการฟังก์ชันเปลี่ยนสีของรายการตามผลลัพธ์
   - บันทึกและโหลดตำแหน่งของการ์ดจาก Local Storage
   ```javascript
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
   ```

### สรุป
เราได้สรุปวิธีการทำงานของโปรเจ็คในด้านการแสดงผล การจัดการตำแหน่งการ์ด การจัดการข้อมูล และการเปลี่ยนสีของการ์ดตามผลลัพธ์ไว้แล้ว หากมีคำถามหรือสิ่งที่ต้องการให้ปรับปรุงเพิ่มเติมสามารถแจ้งมาได้เลยครับ