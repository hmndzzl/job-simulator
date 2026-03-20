# Job Simulator — REST CRUD API

API REST con operaciones CRUD completas sobre un catálogo de productos, construida con Node.js/Express, PostgreSQL y servida con Nginx. Todo el entorno corre en Docker.

---
## Hugo Méndez
## Nivel entregado

**Nivel 3 — Senior**

## Tabla de contenidos

- [Requisitos](#requisitos)
- [Inicialización](#inicialización)
- [Servicios y puertos](#servicios-y-puertos)
- [Configuración de entorno](#configuración-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Recurso: products](#recurso-products)
- [Endpoints](#endpoints)
- [Códigos de respuesta y errores](#códigos-de-respuesta-y-errores)
- [Ejemplos de uso](#ejemplos-de-uso)

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/) instalados
- Puertos `8080`, `8088` y `5432` disponibles en el host

---

## Inicialización

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd job-simulator
```

### 2. Crear el archivo `.env`

Copiar la plantilla incluida y completar las variables:

```bash
cp .env.example .env
```

El `.env.example` define las variables necesarias (ver [Configuración de entorno](#configuración-de-entorno)).

### 3. Levantar la aplicación

```bash
docker-compose up
```

Docker:
1. Inicia el contenedor de **PostgreSQL** y espera a que esté saludable
2. Ejecuta `init.sql` automáticamente, creando la tabla `products`
3. Inicia la **API** una vez que la base de datos está lista
4. Inicia el servidor **Nginx** que sirve el frontend

> Para correr en segundo plano: `docker-compose up -d`

> Para detener y eliminar los contenedores: `docker-compose down`

> Para eliminar también los datos persistidos: `docker-compose down -v`

### Verificar que todo está arriba

```bash
curl http://localhost:8080/products
# Respuesta esperada: []
```

---

## Servicios y puertos

| Servicio   | Puerto host | Puerto contenedor | URL de acceso              |
|------------|-------------|-------------------|----------------------------|
| API        | `8080`      | `3000`            | http://localhost:8080      |
| Frontend   | `8088`      | `80`              | http://localhost:8088      |
| PostgreSQL | `5432`      | `5432`            | `localhost:5432`           |

---

## Configuración de entorno

Variables definidas en `.env` (basado en `.env.example`):

| Variable      | Descripción                              | Ejemplo       |
|---------------|------------------------------------------|---------------|
| `DB_HOST`     | Hostname del servicio PostgreSQL         | `db`          |
| `DB_PORT`     | Puerto de PostgreSQL                     | `5432`        |
| `DB_NAME`     | Nombre de la base de datos               | `jobsimulator`|
| `DB_USER`     | Usuario de PostgreSQL                    | `user`        |
| `DB_PASSWORD` | Contraseña de PostgreSQL                 | `password`    |
| `APP_PORT`    | Puerto expuesto por la API en el host    | `8080`        |

> El `.env` nunca debe commitearse. Está excluido por `.gitignore`.

---

## Estructura del proyecto

```
job-simulator/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # Pool de conexión a PostgreSQL
│   │   ├── routes/
│   │   │   └── products.js    # Rutas y controladores del recurso
│   │   └── server.js          # Punto de entrada, configuración de Express
│   ├── init.sql               # Script de inicialización del esquema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── js/
│   │   │   ├── config.js      # URL de la API y nombre del recurso
│   │   │   ├── api.js         # Módulo de comunicación con la API
│   │   │   ├── index.js       # Controlador de listado
│   │   │   ├── create.js      # Controlador de creación
│   │   │   ├── edit.js        # Controlador de edición
│   │   │   └── show.js        # Controlador de detalle
│   │   ├── index.html         # Listado de productos
│   │   ├── create.html        # Formulario de creación
│   │   ├── edit.html          # Formulario de edición
│   │   └── show.html          # Vista de detalle
│   ├── nginx.conf
│   └── Dockerfile
├── resources/                 # Dockerfiles de referencia
├── docker-compose.yml
├── .env
├── .env.example
└── .gitignore
```

---

## Recurso: products

El recurso representa un catálogo de **productos**. La API expone el recurso bajo la ruta `/products`.

### Esquema

| Campo    | Tipo SQL        | Tipo JSON | Restricciones              | Significado   |
|----------|-----------------|-----------|----------------------------|---------------|
| `id`     | `SERIAL`        | `integer` | Primary key, autoincrement | ID del producto |
| `campo1` | `VARCHAR(255)`  | `string`  | requerido, no vacío        | Nombre        |
| `campo2` | `VARCHAR(255)`  | `string`  | requerido, no vacío        | Descripción   |
| `campo3` | `VARCHAR(255)`  | `string`  | requerido, no vacío        | Categoría     |
| `campo4` | `INTEGER`       | `integer` | requerido, entero          | Stock         |
| `campo5` | `NUMERIC`       | `number`  | requerido, decimal         | Precio        |
| `campo6` | `BOOLEAN`       | `boolean` | requerido                  | Disponible    |

### Ejemplo de objeto

```json
{
  "id": 1,
  "campo1": "Laptop Pro",
  "campo2": "Laptop de alto rendimiento",
  "campo3": "Electrónica",
  "campo4": 5,
  "campo5": 999.99,
  "campo6": true
}
```

---

## Endpoints

Base URL: `http://localhost:8080`

### Resumen

| Método   | Ruta               | Descripción                         |
|----------|--------------------|-------------------------------------|
| `GET`    | `/products`        | Obtener todos los productos         |
| `GET`    | `/products/:id`    | Obtener un producto por ID          |
| `POST`   | `/products`        | Crear un producto nuevo             |
| `PUT`    | `/products/:id`    | Reemplazar un producto completo     |
| `PATCH`  | `/products/:id`    | Actualizar campos específicos       |
| `DELETE` | `/products/:id`    | Eliminar un producto                |

---

### GET /products

Retorna el listado completo de productos.

**Request**
```
GET /products
```

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "campo1": "Laptop Pro",
    "campo2": "Laptop de alto rendimiento",
    "campo3": "Electrónica",
    "campo4": 5,
    "campo5": 999.99,
    "campo6": true
  },
  {
    "id": 2,
    "campo1": "Teclado Mecánico",
    "campo2": "Teclado con switches Cherry MX",
    "campo3": "Periféricos",
    "campo4": 20,
    "campo5": 89.99,
    "campo6": true
  }
]
```

> Retorna `[]` si no hay registros.

---

### GET /products/:id

Retorna un único producto por su ID.

**Request**
```
GET /products/1
```

**Response `200 OK`**
```json
{
  "id": 1,
  "campo1": "Laptop Pro",
  "campo2": "Laptop de alto rendimiento",
  "campo3": "Electrónica",
  "campo4": 5,
  "campo5": 999.99,
  "campo6": true
}
```

**Response `404 Not Found`**
```json
{ "error": "Registro no encontrado" }
```

---

### POST /products

Crea un nuevo producto. Todos los campos son requeridos.

**Request**
```
POST /products
Content-Type: application/json
```

**Body**
```json
{
  "campo1": "Monitor 4K",
  "campo2": "Monitor UHD de 27 pulgadas",
  "campo3": "Electrónica",
  "campo4": 10,
  "campo5": 349.99,
  "campo6": true
}
```

**Response `201 Created`**
```json
{
  "id": 3,
  "campo1": "Monitor 4K",
  "campo2": "Monitor UHD de 27 pulgadas",
  "campo3": "Electrónica",
  "campo4": 10,
  "campo5": 349.99,
  "campo6": true
}
```

**Response `400 Bad Request`** (datos inválidos o incompletos)
```json
{ "error": "Datos inválidos o incompletos. Revisa los tipos de datos." }
```

---

### PUT /products/:id

Reemplaza completamente un producto existente. Todos los campos son requeridos.

**Request**
```
PUT /products/3
Content-Type: application/json
```

**Body**
```json
{
  "campo1": "Monitor 4K Pro",
  "campo2": "Monitor UHD de 32 pulgadas con HDR",
  "campo3": "Electrónica",
  "campo4": 8,
  "campo5": 499.99,
  "campo6": true
}
```

**Response `200 OK`**
```json
{
  "id": 3,
  "campo1": "Monitor 4K Pro",
  "campo2": "Monitor UHD de 32 pulgadas con HDR",
  "campo3": "Electrónica",
  "campo4": 8,
  "campo5": 499.99,
  "campo6": true
}
```

**Response `400 Bad Request`**
```json
{ "error": "Datos inválidos. PUT requiere todos los campos." }
```

**Response `404 Not Found`**
```json
{ "error": "Registro no encontrado" }
```

---

### PATCH /products/:id

Actualiza solo los campos enviados. Los campos omitidos conservan su valor original.

**Request**
```
PATCH /products/3
Content-Type: application/json
```

**Body** (solo los campos a modificar)
```json
{
  "campo5": 459.99,
  "campo6": false
}
```

**Response `200 OK`**
```json
{
  "id": 3,
  "campo1": "Monitor 4K Pro",
  "campo2": "Monitor UHD de 32 pulgadas con HDR",
  "campo3": "Electrónica",
  "campo4": 8,
  "campo5": 459.99,
  "campo6": false
}
```

**Response `400 Bad Request`** (body vacío)
```json
{ "error": "No se enviaron campos para actualizar" }
```

**Response `400 Bad Request`** (campos no permitidos)
```json
{ "error": "Campos no permitidos" }
```

**Response `404 Not Found`**
```json
{ "error": "Registro no encontrado" }
```

---

### DELETE /products/:id

Elimina un producto. No retorna cuerpo en caso de éxito.

**Request**
```
DELETE /products/3
```

**Response `204 No Content`**
```
(sin cuerpo)
```

**Response `404 Not Found`**
```json
{ "error": "Registro no encontrado" }
```

---

## Códigos de respuesta y errores

### Códigos HTTP utilizados

| Código | Significado      | Cuándo se usa                                              |
|--------|------------------|------------------------------------------------------------|
| `200`  | OK               | GET por ID exitoso, PUT y PATCH exitosos                   |
| `201`  | Created          | POST exitoso                                               |
| `204`  | No Content       | DELETE exitoso                                             |
| `400`  | Bad Request      | Validación fallida, tipos incorrectos, campos faltantes    |
| `404`  | Not Found        | El recurso solicitado no existe                            |
| `500`  | Internal Server Error | Error inesperado del servidor o base de datos         |

### Mensajes de error por endpoint

| Endpoint       | Código | Mensaje                                                      |
|----------------|--------|--------------------------------------------------------------|
| GET /:id       | `404`  | `"Registro no encontrado"`                                   |
| GET /:id       | `500`  | `"Error interno del servidor"`                               |
| POST /         | `400`  | `"Datos inválidos o incompletos. Revisa los tipos de datos."`|
| POST /         | `500`  | `"Error al insertar en la base de datos"`                    |
| PUT /:id       | `400`  | `"Datos inválidos. PUT requiere todos los campos."`          |
| PUT /:id       | `404`  | `"Registro no encontrado"`                                   |
| PUT /:id       | `500`  | `"Error al actualizar"`                                      |
| PATCH /:id     | `400`  | `"No se enviaron campos para actualizar"`                    |
| PATCH /:id     | `400`  | `"Campos no permitidos"`                                     |
| PATCH /:id     | `404`  | `"Registro no encontrado"`                                   |
| PATCH /:id     | `500`  | `"Error al actualizar parcialmente"`                         |
| DELETE /:id    | `404`  | `"Registro no encontrado"`                                   |
| DELETE /:id    | `500`  | `"Error al eliminar"`                                        |

### Reglas de validación

- Todos los campos (`campo1`–`campo6`) son **requeridos** en POST y PUT
- `campo1`, `campo2`, `campo3`: deben ser strings no vacíos
- `campo4`: debe ser un **entero** estricto (`Number.isInteger`)
- `campo5`: debe ser un **número** (entero o decimal)
- `campo6`: debe ser un **booleano** (`true` o `false`)
- En PATCH: solo se aceptan los campos `campo1`–`campo6`; cualquier otra clave resulta en `400`

---

## Ejemplos de uso

### Con cURL

**Listar todos los productos**
```bash
curl http://localhost:8080/products
```

**Obtener un producto por ID**
```bash
curl http://localhost:8080/products/1
```

**Crear un producto**
```bash
curl -X POST http://localhost:8080/products \
  -H "Content-Type: application/json" \
  -d '{
    "campo1": "Auriculares Bluetooth",
    "campo2": "Auriculares inalámbricos con cancelación de ruido",
    "campo3": "Audio",
    "campo4": 15,
    "campo5": 129.99,
    "campo6": true
  }'
```

**Reemplazar un producto completo**
```bash
curl -X PUT http://localhost:8080/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "campo1": "Auriculares Bluetooth Pro",
    "campo2": "Auriculares premium con 40h de batería",
    "campo3": "Audio",
    "campo4": 10,
    "campo5": 179.99,
    "campo6": true
  }'
```

**Actualizar solo el precio y la disponibilidad**
```bash
curl -X PATCH http://localhost:8080/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "campo5": 159.99,
    "campo6": false
  }'
```

**Eliminar un producto**
```bash
curl -X DELETE http://localhost:8080/products/1
```

---

### Con JavaScript (fetch)

**Crear un producto**
```javascript
const response = await fetch("http://localhost:8080/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    campo1: "Mouse Inalámbrico",
    campo2: "Mouse ergonómico con DPI ajustable",
    campo3: "Periféricos",
    campo4: 30,
    campo5: 45.99,
    campo6: true,
  }),
});

const producto = await response.json();
console.log(producto); // { id: 4, campo1: "Mouse Inalámbrico", ... }
```

**Actualización parcial**
```javascript
const response = await fetch("http://localhost:8080/products/4", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ campo4: 25 }),
});

const actualizado = await response.json();
console.log(actualizado.campo4); // 25
```

---

## Stack

| Componente | Tecnología          |
|------------|---------------------|
| API        | Node.js 20, Express |
| Base de datos | PostgreSQL 16    |
| Frontend   | HTML, Tailwind CSS, Vanilla JS |
| Servidor web | Nginx Alpine      |
| Contenedores | Docker, Docker Compose |

---

