
const EQUIPMENTS = [
    { name: 'Service 1', address: '127.0.0.1:50051' },
    { name: 'Service 2', address: '127.0.0.1:50052' },
    { name: 'Service 3', address: '127.0.0.1:50053' }
];

let currentIndex = 0;


function selectEquipment() {
    const selected = EQUIPMENTS[currentIndex];
   
    currentIndex = (currentIndex + 1) % EQUIPMENTS.length;
    return selected;
}


function getAllEquipments() {
    return EQUIPMENTS;
}

module.exports = { selectEquipment, getAllEquipments };