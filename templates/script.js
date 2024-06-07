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
    const hideUndefined = document.getElementById("toggle-undefined").checked; // ดึงสถานะของ checkbox
    showLoading();
    try {
        const response = await fetch(`/realtime_data?family=${family}`);
        const data = await response.json();
        document.getElementById("data-container").innerHTML = renderCards(data.stations);
        if (hideUndefined) {
            toggleUndefinedCards();
        }
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
                                <div class="item" data-item-id="${item.id}" style="background-color: ${getColor(item.result, item.display)};">
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
function getColor(result, display) {
    if (display === '0:00:00') {
        return 'white';
    }
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
    const urlParams = new URLSearchParams(window.location.search);
    const family = urlParams.get('family');
    if (family) {
        document.getElementById('family-select').value = family;
    }
    fetchData();
    setupAutoRefresh(3 * 60 * 1000); // 3 นาที
});

