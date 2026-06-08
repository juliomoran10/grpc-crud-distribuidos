const grpcWrapper = require('../shared/grpc-wrapper');

const SERVICE_NAME = process.argv[2] || 'Service 1';
const PORT = process.argv[3] || '50051';

const localBD = new Map();

const crudImplementations = {
    createPersona: (call, callback) => {
        const { ci, nombre, apellido } = call.request;
        if (!ci || !nombre || !apellido) {
            return callback(null, { success: false, message: 'Incomplete fields.' });
        }
        localBD.set(ci, { ci, nombre, apellido });
        console.log(`Saved to DB: ${nombre} ${apellido} (CI: ${ci})`);
        callback(null, { success: true, message: `Successfully saved in ${SERVICE_NAME}` });
    },

    readPersona: (call, callback) => {
        const { ci } = call.request;
        const persona = localBD.get(ci);
        if (!persona) {
            return callback(null, { ci: '', nombre: '', apellido: '' });
        }
        console.log(`Record found for CI: ${ci}`);
        callback(null, persona);
    },

    updatePersona: (call, callback) => {
        const { ci, nombre, apellido } = call.request;
        if (!localBD.has(ci)) {
            return callback(null, { success: false, message: `CI ${ci} does not exist in ${SERVICE_NAME}` });
        }
        localBD.set(ci, { ci, nombre, apellido });
        console.log(`Record updated for CI: ${ci}`);
        callback(null, { success: true, message: `Updated in ${SERVICE_NAME}` });
    },

    deletePersona: (call, callback) => {
        const { ci } = call.request;
        if (!localBD.has(ci)) {
            return callback(null, { success: false, message: `CI ${ci} does not exist in ${SERVICE_NAME}` });
        }
        localBD.delete(ci);
        console.log(`Record deleted for CI: ${ci}`);
        callback(null, { success: true, message: `Deleted from ${SERVICE_NAME}` });
    }
};

grpcWrapper.createServer(PORT, crudImplementations);
console.log(`${SERVICE_NAME} successfully initialized.`);