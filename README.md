# Distributed CRUD over gRPC

A distributed CRUD system built with **gRPC microservices**, featuring a **load balancer**, a **name service** (service discovery) and an HTTP **web gateway**. A hands-on exploration of scalable backend architecture.

## Architecture

```
┌────────────┐     HTTP      ┌─────────────┐     gRPC      ┌────────────────┐
│ web-server │ ────────────> │  balancer   │ ────────────> │ microservices  │
│ (gateway)  │               │ (load bal.) │               │ (CRUD workers) │
└────────────┘               └─────────────┘               └────────────────┘
                                   │  looks up / registers        ▲
                                   ▼  instances                   │
                              ┌──────────────┐                    │
                              │ name-service │────────────────────┘
                              │ (discovery)  │
                              └──────────────┘
```

- **web-server** — HTTP gateway that exposes the CRUD API to clients and forwards requests over gRPC.
- **balancer** — distributes incoming gRPC calls across the available service instances.
- **name-service** — service registry: instances register here and are discovered dynamically.
- **microservices** — the CRUD workers that do the actual work.
- **proto** — shared Protocol Buffers definitions.
- **shared** — code shared across components.

## Tech stack

- Node.js
- `@grpc/grpc-js` + `@grpc/proto-loader`
- Express (HTTP gateway)

## Getting started

```bash
npm install
```

Start the components (in separate terminals), in this order:

```bash
node name-service/...     # 1. service registry
node microservices/...    # 2. one or more CRUD instances
node balancer/...         # 3. load balancer
node web-server/...       # 4. HTTP gateway
```

> Revisa los archivos dentro de cada carpeta para el nombre exacto del punto de entrada y los puertos.

## Concepts demonstrated

- Service-to-service communication with gRPC + Protocol Buffers
- Client-side / proxy load balancing
- Dynamic service discovery
- Separation of transport (HTTP) and internal RPC

---

Hecho por [Julio Morán](https://www.linkedin.com/in/julio-moran-52ab51309) · [GitHub](https://github.com/juliomoran10)
