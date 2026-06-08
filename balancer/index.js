const axios = require('axios');


const EQUIPMENTS = [
    { name: 'Service 1', grpcAddress: '127.0.0.1:50051', statusUrl: 'http://localhost:3001' },
    { name: 'Service 2', grpcAddress: '127.0.0.1:50052', statusUrl: 'http://localhost:3002' },
    { name: 'Service 3', grpcAddress: '192.168.1.XX:50053', statusUrl: 'http://192.168.1.XX:3003' }
];

async function selectBestServer() {
    let best = null;
    let maxScore = -1;

    for (let s of EQUIPMENTS) {
        try {
            const { data } = await axios.get(`${s.statusUrl}/status`, { timeout: 800 });
            
            
            let score = 0;
            score += (data.cpuSpeed * 0.20);            
            score += (data.memFree / 1e9 * 0.10);         
            score += (data.diskType.includes('SSD') ? 30 : 10); 
            score += (100 - data.processTime) * 0.40;     

            if (score > maxScore) {
                maxScore = score;
                best = s;
            }
        } catch (e) {
            
            console.log(`> ${s.name} inalcanzable, buscando otra opción...`);
        }
    }
    
    return best;
}

module.exports = { selectBestServer };