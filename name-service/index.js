const http = require('http');

const PORT = 3000;


const registry = {};

const server = http.createServer((req, res) => {
    
    res.setHeader('Content-Type', 'application/json');

    
    if (req.method === 'POST' && req.url === '/register') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { id, ip, port, metrics } = JSON.parse(body);
                
                if (!id || !ip || !port) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'Faltan campos requeridos: id, ip, port' }));
                }

                
                registry[id] = {
                    ip,
                    port,
                    metrics: metrics || {},
                    lastSeen: Date.now() 
                };

                console.log(` Nodo registrado/actualizado: [${id}] en ${ip}:${port}`);
                
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: `Nodo ${id} registrado correctamente.` }));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Cuerpo de petición inválido (Debe ser JSON)' }));
            }
        });

    
    } else if (req.method === 'GET' && req.url === '/services') {
        const now = Date.now();
        
        
        Object.keys(registry).forEach(id => {
            if (now - registry[id].lastSeen > 12000) {
                console.log(` Nodo removido por inactividad (Timeout): [${id}]`);
                delete registry[id];
            }
        });

        res.statusCode = 200;
        res.end(JSON.stringify(registry));

  
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(` NameService ejecutándose en: http://localhost:${PORT}`);
});