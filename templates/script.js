const items = document.querySelectorAll('.item');

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

// ฟังก์ชันสำหรับแสดงการโหลดข้อมูล
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// ฟังก์ชันสำหรับซ่อนการโหลดข้อมูล
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// ฟังก์ชันสำหรับดึงข้อมูลจากเซิร์ฟเวอร์
async function fetchData() {
    const family = document.getElementById("family-select").value;
    showLoading();
    try {
        const response = await fetch(`/realtime_data?family=${family}`);
        const data = await response.json();
        document.getElementById("data-container").innerHTML = renderCards(data.stations);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        hideLoading();
    }
}

// ฟังก์ชันสำหรับแสดงผลข้อมูลในรูปแบบการ์ด
function renderCards(stations) {
    let html = '';
    for (const [group, stationData] of Object.entries(stations)) {
        for (const [source, items] of Object.entries(stationData)) {
            const url = truncateUrl(items[0].url);
            const isOffline = !items || items.length === 0;

            html += `
                <div class="card" data-card-id="${source}">
                    <div class="card-header">
                        <h2><a href="${url}">${source}</a></h2>
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

// ฟังก์ชันสำหรับตัด url
function truncateUrl(url) {
    return url.replace('get_all_process_stations_ui/', '');
}

// ฟังก์ชันสำหรับกำหนดสีของผลลัพธ์
function getColor(result) {
    switch(result) {
        case 'PASSED': return 'lightgreen';
        case 'FAILED': return 'lightcoral';
        case 'ABORTED': return 'lightblue';
        case '': return 'orange';
        default: return 'white';
    }
}

// เริ่มต้นเมื่อ DOM ถูกโหลด
document.addEventListener('DOMContentLoaded', () => {
    fetchData().then(() => {
        setInterval(() => {
            fetchData();
        }, 2 * 60 * 1000); // Refresh every 2 minutes
    });
});
