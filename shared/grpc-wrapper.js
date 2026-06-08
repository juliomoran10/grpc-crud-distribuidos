const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, '../proto/persona.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const personaProto = protoDescriptor.persona;

module.exports = {
    PersonaService: personaProto.PersonaService.service,
    grpc,
    
    createClient: (address) => {
        return new personaProto.PersonaService(address, grpc.credentials.createInsecure());
    },

    createServer: (port, implementations) => {
        const server = new grpc.Server();
        server.addService(personaProto.PersonaService.service, implementations);
        server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
            if (err) {
                console.error(`Error on port ${port}:`, err);
                return;
            }
            console.log(`gRPC Server active on port: ${bindPort}`);
        });
        return server;
    }
};