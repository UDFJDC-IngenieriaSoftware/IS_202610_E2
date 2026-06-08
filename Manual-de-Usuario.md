# MANUAL DE USUARIO
## Arriendos360 — Gestión Inteligente de Arrendamientos
**Universidad Distrital Francisco José de Caldas**  
**Especialización en Ingeniería de Software — Ingeniería de Software I**  
**Versión:** 1.0 — Junio 2026

---

## 1. Introducción

Arriendos360 es una plataforma web para digitalizar la gestión de arrendamientos inmobiliarios. Permite a los propietarios administrar sus contratos, registrar pagos, detectar mora y visualizar estadísticas del negocio desde un único panel de control.

Este manual está dirigido a dos tipos de usuario:
- **Propietario (Arrendador):** Acceso completo a todas las funciones del sistema.
- **Inquilino (Arrendatario):** Acceso de consulta a su contrato e historial de pagos.

---

## 2. Requisitos para usar el sistema

| Requisito | Detalle |
|-----------|---------|
| Navegador web | Google Chrome, Mozilla Firefox o Microsoft Edge (versiones recientes) |
| Conexión a internet | Requerida permanentemente |
| Dispositivo | Computador de escritorio o portátil (optimizado para pantallas ≥ 1280px) |

---

## 3. Iniciar el sistema

### Opción A — Con Docker (recomendado)

1. Asegurarse de que **Docker Desktop** esté abierto y corriendo.
2. Abrir una terminal en la carpeta raíz del proyecto.
3. Ejecutar:

```bash
docker-compose down -v
docker-compose up --build
```

4. Esperar a que aparezcan los mensajes:
   - `database system is ready to accept connections` → Base de datos lista
   - `Servidor corriendo en http://localhost:3001` → Backend listo
   - `Compiled successfully` → Frontend listo

5. Abrir el navegador en: **http://localhost:3000**

> **Nota:** La primera vez tarda 3-5 minutos mientras instala las dependencias dentro de los contenedores.

### Opción B — Sin Docker (manual)

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 4. Crear el usuario de prueba

Si es la primera vez que usa el sistema, ejecutar el siguiente comando para crear el usuario administrador de prueba:

```bash
docker exec arriendos360_api node seed.js
```

Esto crea automáticamente:
- **Correo:** `admin@arriendos360.com`
- **Contraseña:** `admin123`
- **Rol:** Propietario

---

## 5. Módulo de Autenticación

### 5.1 Iniciar sesión

1. Abrir el navegador en `http://localhost:3000`
2. El sistema redirige automáticamente a la pantalla de **Login**
3. Ingresar las credenciales:
   - **Correo electrónico:** su correo registrado
   - **Contraseña:** su contraseña
4. Hacer clic en **Ingresar**
5. Si las credenciales son correctas, el sistema redirige al **Dashboard**

> **Error frecuente:** Si aparece "Credenciales inválidas", verificar que el correo no tenga espacios y que el sistema esté corriendo (`http://localhost:3001` debe responder).

### 5.2 Registrar un nuevo usuario propietario

Usando Postman o cualquier cliente HTTP:

- **URL:** `POST http://localhost:3001/api/auth/register`
- **Body (JSON):**
```json
{
  "correo": "nuevo@ejemplo.com",
  "contrasena": "miPassword123",
  "rol": "propietario",
  "documento": "12345678",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "telefono": "3001234567"
}
```

### 5.3 Cerrar sesión

Actualmente el cierre de sesión se realiza cerrando la pestaña del navegador o eliminando el token almacenado en el almacenamiento local del navegador (F12 → Application → Local Storage → eliminar `token`).

---

## 6. Módulo de Inmuebles

### 6.1 Ver lista de inmuebles

1. En el menú lateral, hacer clic en **Inmuebles**
2. El sistema muestra la lista de propiedades registradas asociadas al propietario autenticado

### 6.2 Registrar un nuevo inmueble

1. Ir a **Inmuebles** en el menú lateral
2. Hacer clic en el botón **Nuevo Inmueble**
3. Completar el formulario con los datos de la propiedad:
   - Dirección
   - Tipo de inmueble (Apartamento, Casa, Local, Apartaestudio, Finca)
   - Área en m²
   - Número de habitaciones y baños
   - Estrato
   - Estado de ocupación
4. Hacer clic en **Guardar**

### 6.3 Editar o eliminar un inmueble

1. En la lista de inmuebles, localizar la propiedad deseada
2. Hacer clic en el ícono de **editar** (lápiz) para modificar los datos
3. Hacer clic en el ícono de **eliminar** (papelera) para borrar el registro

> **Nota:** Solo se pueden eliminar inmuebles que no tengan contratos activos asociados.

---

## 7. Módulo de Contratos

### 7.1 Ver contratos activos

1. En el menú lateral, hacer clic en **Contratos**
2. Se muestra la lista de contratos asociados al propietario, con su estado actual

### 7.2 Registrar un nuevo contrato

1. Ir a **Contratos** → **Nuevo Contrato**
2. Completar los campos obligatorios:
   - **Inmueble:** seleccionar de la lista de inmuebles disponibles
   - **Documento del inquilino:** cédula del arrendatario
   - **Fecha de inicio:** fecha en que comienza el arriendo
   - **Fecha de fin:** fecha de terminación pactada
   - **Valor mensual:** canon de arrendamiento en pesos colombianos (COP)
   - **Depósito:** valor del depósito (opcional)
3. Adjuntar el PDF del contrato firmado (opcional, máx. 5 MB)
4. Hacer clic en **Guardar Contrato**

Al guardar, el contrato queda en estado **Activo (1)** en el sistema.

### 7.3 Finalizar un contrato

1. En la lista de contratos, localizar el contrato a finalizar
2. Hacer clic en **Finalizar**
3. El sistema cambia el estado del contrato a **Finalizado (2)**

> **Importante:** Al finalizar un contrato, el sistema alertará si existen pagos pendientes asociados.

---

## 8. Módulo de Pagos

### 8.1 Ver pagos

1. En el menú lateral, hacer clic en **Pagos**
2. Se muestra la lista de pagos registrados, filtrada según el rol:
   - **Propietario:** ve todos los pagos de sus contratos
   - **Inquilino:** ve solo los pagos de su contrato

### 8.2 Registrar un cobro mensual

1. Ir a **Pagos** → **Nuevo Pago**
2. Completar los campos:
   - **Contrato:** seleccionar el contrato activo
   - **Monto total:** valor del canon mensual
   - **Mes correspondiente:** mes al que corresponde el cobro
3. Hacer clic en **Guardar**

El pago queda en estado **Pendiente (1)**.

### 8.3 Registrar el pago de un inquilino

Cuando el inquilino realiza el pago:

1. En la lista de pagos, localizar el cobro correspondiente (estado: Pendiente)
2. Hacer clic en **Registrar Pago**
3. Ingresar:
   - **Monto pagado:** puede ser el total o un pago parcial
   - **Tipo de transacción:** transferencia, efectivo, etc.
   - **Observaciones:** (opcional)
4. Hacer clic en **Confirmar**

El sistema actualiza automáticamente:
- Si `monto_pagado >= saldo_pendiente` → estado cambia a **Pagado (2)**
- Si `monto_pagado < saldo_pendiente` → estado permanece **Pendiente (1)** con saldo reducido

### 8.4 Verificar pagos en mora

1. Ir a **Pagos** → **Verificar Mora**
2. El sistema recorre todos los pagos pendientes cuya fecha de vencimiento ya pasó
3. Los marca automáticamente como **Vencido (3)**

### 8.5 Consultar pagos pendientes

1. En el menú de **Pagos**, filtrar por estado "Pendiente"
2. Se muestra la lista ordenada por fecha, con el saldo pendiente de cada uno

### 8.6 Generar recibo de pago

1. En la lista de pagos, localizar el pago deseado
2. Hacer clic en **Ver Recibo**
3. El sistema genera un recibo con:
   - Número de recibo único
   - Fecha de emisión
   - Datos del inquilino y el inmueble
   - Monto y estado del pago

---

## 9. Módulo Dashboard

### 9.1 Ver estadísticas del negocio

1. Al iniciar sesión como propietario, el sistema redirige automáticamente al **Dashboard**
2. También se puede acceder desde el menú lateral → **Dashboard**

El panel muestra 4 indicadores clave:

| Indicador | Descripción |
|-----------|-------------|
| **Ingresos Totales** | Suma de todos los pagos recibidos |
| **Contratos Activos** | Número de contratos en estado activo |
| **Inmuebles Arrendados** | Cantidad de propiedades con contrato vigente |
| **Pagos Pendientes** | Número de cobros sin pagar |

> **Nota:** Los indicadores se actualizan en tiempo real consultando la base de datos en cada carga de la página.

---

## 10. Verificación del sistema (pruebas básicas)

Para confirmar que todo funciona correctamente, realizar el siguiente flujo de prueba:

### Flujo completo recomendado

1. ✅ **Login** → ingresar con `admin@arriendos360.com` / `admin123`
2. ✅ **Crear inmueble** → agregar una propiedad con dirección y tipo
3. ✅ **Registrar contrato** → asociar el inmueble con un inquilino ficticio
4. ✅ **Crear cobro** → registrar un pago pendiente para el contrato
5. ✅ **Registrar pago** → marcar el cobro como pagado
6. ✅ **Ver dashboard** → verificar que los indicadores se actualizaron
7. ✅ **Verificar mora** → ejecutar el motor de mora para actualizar estados

### Verificar que el backend responde

Abrir en el navegador: `http://localhost:3001/`

Respuesta esperada:
```json
{ "mensaje": "🏠 API Arriendos360 funcionando" }
```

---

## 11. Solución de problemas frecuentes

| Problema | Causa probable | Solución |
|---------|---------------|---------|
| `Error de conexión a la base de datos` | El contenedor de BD no está conectado a la red | Ejecutar: `docker network connect is_202610_e2_default arriendos360_db` y reiniciar el backend |
| Puerto 5432 ya en uso | Otro servicio PostgreSQL está corriendo | Detener el otro contenedor: `docker stop postgres_db` |
| `Docker Desktop not running` | Docker Desktop cerrado | Abrir Docker Desktop y esperar a que el ícono quede estático |
| La página carga pero no muestra datos | El seed no se ejecutó | Ejecutar: `docker exec arriendos360_api node seed.js` |
| Error 401 en endpoints del dashboard | No hay token de autenticación | Iniciar sesión primero y verificar que el token se envíe en el header |
| `nodemon: not found` | node_modules no instalado dentro de Docker | Ejecutar: `docker-compose down -v && docker-compose up --build` |

---

## 12. Estructura del sistema (referencia técnica)

```
IS_202610_E2/
├── backend/                  # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio por módulo
│   │   ├── models/           # Modelos Sequelize (ORM)
│   │   ├── routes/           # Definición de endpoints
│   │   └── middlewares/      # JWT, upload de archivos
│   ├── database/schema.sql   # Script DDL de la base de datos
│   └── seed.js               # Script para crear usuario de prueba
├── frontend/                 # Aplicación React
│   └── src/
│       ├── pages/            # Pantallas: Login, Dashboard, Inmuebles, Contratos, Pagos
│       ├── components/       # Layout, ProtectedRoute
│       └── services/api.js   # Configuración de llamadas al backend
├── docker-compose.yml        # Orquestación de contenedores
└── Arriendos360.postman_collection.json  # Colección de pruebas API
```

---

## 13. Usuarios del sistema

| Rol | Acceso | Credenciales de prueba |
|-----|--------|----------------------|
| Propietario | Dashboard, Inmuebles, Contratos, Pagos (lectura y escritura) | `admin@arriendos360.com` / `admin123` |
| Inquilino | Solo consulta de su contrato e historial de pagos | Crear via API `/api/auth/register` con `"rol": "inquilino"` |

---

*Manual de Usuario — Arriendos360 v1.0 — Junio 2026*  
*Universidad Distrital Francisco José de Caldas — Especialización en Ingeniería de Software*
