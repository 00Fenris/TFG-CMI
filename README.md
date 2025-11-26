# Cuadro de Mando Integral - Claunafood S.L.


## Running the demo with Docker

This project includes a `docker-compose.yml` which will start Postgres, the backend and the frontend.

To build and run the full demo:

```bash
docker compose up --build
```

The API will be at `http://localhost:4000` and the frontend at `http://localhost:3000`.

Default seeded users:
- admin@claunafood.local / password
- manager.salamanca@claunafood.local / password

Test login with curl:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"admin@claunafood.local","password":"password"}' http://localhost:4000/auth/login
```


Estructura:
- backend/ - servidor Express + Sequelize
- frontend/ - aplicación React

Siguientes pasos: diseñar el esquema de base de datos, implementar endpoints y UI.

Este documento se generó automáticamente por GitHub Copilot; editar según sea necesario.

## Smoke test (quick verification)
1. Levanta el stack en background con Docker:

```bash
docker compose up --build -d
```

2. Ejecuta el script de comprobación (incluye login y chequeo de /restaurants):

```bash
./scripts/verify-demo.sh
```

## Modo desarrollo (con Docker override)

Este repo incluye un archivo `docker-compose.override.yml` pensado para desarrollo. Con él, `docker compose up` usará mounts y comandos de desarrollo (nodemon, react-scripts), lo que facilita hot-reload de código.

Por ejemplo, desde la raíz del repo:

```bash
# Arranca el stack en modo dev (usa docker-compose.override.yml automáticamente)
docker compose up --build

# En segundo plano (detached):
docker compose up --build -d

# Ver estado y logs:
docker compose ps
docker compose logs -f backend

# Parar y limpiar:
docker compose down -v
```

El override hace que:
- `backend` arranque con `npm run dev` y monte `./backend:/app` (nodemon)
- `frontend` arranque con `npm start` desde node (hot reload) y mapea el puerto 3000

Recuerda que si tu host no tiene `docker` corriendo, primero lanza Docker Desktop.

Troubleshooting tips:

- If you see errors like "zsh: unknown file attribute: b" or "no such service: #", it likely means you included an inline comment in a command, for example:

```
docker compose up --build -d  # -d = detached (background)
```

Avoid putting comments after commands in zsh. Instead, run commands on separate lines or remove inline comments. Use the bundled helper to start the stack:

```
./scripts/docker-up.sh
```

If you get JSON parse errors in shell scripts or tools (like "Expecting value: line 1 column 1"), inspect the raw response with `curl` and make sure the backend is running first.

Notas de desarrollo:

- El `docker-compose.override.yml` remapea el frontend al puerto 3001 para evitar conflictos de puerto con procesos locales (3001:3000). Abre la UI de dev en: http://localhost:3001
- En la pantalla de login hay botones de "Login as Admin" y "Login as Manager" para acceder rápidamente con los usuarios seed (admin@claunafood.local / password) si el login falla por problemas de red o CORS durante el desarrollo.
- Si necesitas exponer servicios desde el host al contenedor en macOS, puedes usar `host.docker.internal` en `REACT_APP_API_URL` o configurar un `proxy` en `frontend/package.json`.



