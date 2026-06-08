const http = require('http');
const url = require('url');
const balancer = require('../balancer/index');
const grpcWrapper = require('../shared/grpc-wrapper');

const PORT = 8080;

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'POST' && parsedUrl.pathname === '/persona') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const persona = JSON.parse(body);
                const targetNode = await balancer.selectBestServer();

                if (!targetNode) {
                    res.statusCode = 503;
                    return res.end(JSON.stringify({ error: 'No available servers in the network.' }));
                }

                console.log(`Balancer routed this creation request to: ${targetNode.name} (${targetNode.grpcAddress})`);

                const client = grpcWrapper.createClient(targetNode.grpcAddress);
                client.createPersona(persona, (err, response) => {
                    if (err) { 
                        res.statusCode = 500; 
                        return res.end(JSON.stringify({ error: err.message })); 
                    }
                    res.statusCode = 201;
                    res.end(JSON.stringify(response));
                });
            } catch (e) {
                res.statusCode = 400; 
                res.end(JSON.stringify({ error: 'Invalid JSON format' }));
            }
        });

    } else if (req.method === 'GET' && parsedUrl.pathname === '/persona') {
        const ci = parsedUrl.query.ci;
        if (!ci) { 
            res.statusCode = 400; 
            return res.end(JSON.stringify({ error: 'Missing ci parameter' })); 
        }

        const equipments = balancer.getAllEquipments();
        let recordFound = null;

        for (const eq of equipments) {
            const client = grpcWrapper.createClient(eq.grpcAddress);
            const result = await new Promise(resolve => {
                client.readPersona({ ci }, (err, resp) => {
                    if (!err && resp && resp.ci) resolve(resp);
                    else resolve(null);
                });
            });
            if (result) { 
                recordFound = result; 
                break; 
            }
        }

        if (!recordFound) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Persona not found in any equipment.' }));
        }
        res.statusCode = 200; 
        res.end(JSON.stringify(recordFound));

    } else if (req.method === 'PUT' && parsedUrl.pathname === '/persona') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const persona = JSON.parse(body);
                const equipments = balancer.getAllEquipments();
                let isUpdated = false;

                for (const eq of equipments) {
                    const client = grpcWrapper.createClient(eq.grpcAddress);
                    const success = await new Promise(resolve => {
                        client.updatePersona(persona, (err, resp) => resolve(!err && resp.success));
                    });
                    if (success) { 
                        isUpdated = true; 
                        break; 
                    }
                }

                res.statusCode = isUpdated ? 200 : 404;
                res.end(JSON.stringify({ success: isUpdated, message: isUpdated ? 'Updated successfully' : 'Record not found' }));
            } catch { 
                res.statusCode = 400; 
                res.end(JSON.stringify({ error: 'Invalid JSON format' })); 
            }
        });

    } else if (req.method === 'DELETE' && parsedUrl.pathname === '/persona') {
        const ci = parsedUrl.query.ci;
        const equipments = balancer.getAllEquipments();
        let isDeleted = false;

        for (const eq of equipments) {
            const client = grpcWrapper.createClient(eq.grpcAddress);
            const success = await new Promise(resolve => {
                client.deletePersona({ ci }, (err, resp) => resolve(!err && resp.success));
            });
            if (success) { 
                isDeleted = true; 
                break; 
            }
        }

        res.statusCode = isDeleted ? 200 : 404;
        res.end(JSON.stringify({ success: isDeleted, message: isDeleted ? 'Deleted successfully' : 'Record not found' }));
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Web Server (HTTP) running on http://localhost:${PORT}`);
});