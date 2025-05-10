# Dockerized MERN Application

---

## 1. Prerequisites

- Docker installed on the machine
- Docker Compose installed
- Project directory structure as below
  ```plaintext
  code/
  ├── backend/
  │   ├── Dockerfile
  │   ├── public/
  │   │   └── favicon.ico
  ├── frontend/
  │   ├── Dockerfile
  │   ├── nginx.conf
  │   ...
  └── docker-compose.yml
  ```

---

## 2. Frontend Dockerfile

Located at `frontend/Dockerfile`:

1. Uses Node Alpine to install dependencies and build the production bundle.
2. Uses a lightweight Nginx image to serve static files.

---
## 3. Nginx Configuration (nginx.conf)

Located at frontend/nginx.conf, this file sets up routing and gzip compression. This ensures single‑page app routing works correctly and enables gzip compression for common asset types

---
## 4. Backend Dockerfile

Located at `backend/Dockerfile`:

- Installs dependencies
- Exposes port 5000
- Starts the application with `npm start`

Static Assets (public/)

Backend should also include a public/ directory for static assets.

```bash
backend/public/favicon.ico
```
Configure your server (e.g., Express) to serve files from this folder as needed.

---

## 5. Docker Compose Configuration

File: `docker-compose.yml`

> **Note:** Move any sensitive values (like `MONGODB_URI`) into `.env` files and reference them with `${VAR_NAME}` syntax.

---

## 5. Running the Containers

1. From the `code` directory, build and start all services:

   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

2. To view logs:

   ```bash
   docker-compose logs
   ```

3. To stop and remove containers:

   ```bash
   docker-compose down
   ```

4. To rebuild a specific service:

   ```bash
   docker-compose up --build -d frontend
   docker-compose up --build -d backend
   ```

---

## 6. Accessing the Application

- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:5000


