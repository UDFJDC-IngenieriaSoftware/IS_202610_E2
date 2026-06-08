# INFORME FINAL / POSTMORTEM
## Arriendos360 — Gestión Inteligente de Arrendamientos
**Universidad Distrital Francisco José de Caldas**  
**Especialización en Ingeniería de Software — Ingeniería de Software I**  
**Equipo:** Laura Alejandra Merchán León · Juan Sebastián Díaz Rodríguez · Marlon Alexander Herrera Choachi  
**Profesor:** José Joaquín Bocanegra García  
**Fecha:** Junio 2026

---

## 1. Resumen Ejecutivo

Arriendos360 es una plataforma web para la gestión de arrendamientos inmobiliarios, desarrollada como MVP académico en 14 semanas por un equipo de 3 integrantes. El sistema permite a propietarios gestionar contratos, registrar pagos, detectar mora y visualizar estadísticas del negocio; y a inquilinos consultar su información contractual.

El proyecto se desarrolló bajo un modelo iterativo e incremental con prácticas de Kanban y Git Flow, entregando un sistema funcional con backend REST, frontend React y base de datos PostgreSQL, orquestados mediante Docker Compose.

---

## 2. Resultados vs. Plan

### 2.1 Esfuerzo real vs. estimado

| Parámetro | Planificado | Real |
|-----------|------------|------|
| Duración | 14 semanas | 14 semanas |
| Horas totales | 420 hrs | ~390 hrs |
| Integrantes | 3 personas | 3 personas |
| Story Points | 24 pts | ~20 pts entregados |

### 2.2 Cumplimiento por módulo

| Módulo | Story Points Plan | Entregado | % Cumplimiento |
|--------|------------------|-----------|---------------|
| Autenticación | 3 pts | Login, JWT, roles, registro propietario | 90% |
| Contratos | 8 pts | CRUD, PDF, estados, filtrado por perfil | 80% |
| Financiero | 8 pts | Pagos parciales, mora, historial, recibo JSON | 85% |
| Dashboard | 5 pts | 4 KPIs en tiempo real, gráfico pendiente | 60% |
| Infraestructura | N/A | Docker Compose, Postman, seed, DDL | 100% |

### 2.3 Requisitos funcionales entregados

**Completados (Must Have):** RF-01, RF-03, RF-05, RF-06, RF-07, RF-09, RF-10, RF-12, RF-13, RF-14, RF-17, RF-18 — **12 de 19 RF**

**Parciales:** RF-02, RF-04, RF-08, RF-11, RF-15, RF-16, RF-19 — **7 RF**

**Requisitos No Funcionales:** RNF-01 (bcrypt), RNF-02 (JWT), RNF-04 (ORM/SQL Injection), RNF-11 (modularidad) completamente implementados.

---

## 3. Lo que salió bien (Continue)

### Técnico
- **Arquitectura modular:** La separación en capas (Frontend / Backend / BD) permitió que cada integrante trabajara en paralelo sin bloqueos.
- **Docker Compose:** La containerización desde el inicio eliminó problemas de entorno entre los tres equipos de trabajo. El comando `docker-compose up --build` levanta el sistema completo de forma reproducible.
- **Git Flow con Pull Requests:** El uso de ramas por funcionalidad y revisión cruzada antes de mergear a `main` evitó conflictos y mejoró la calidad del código integrado.
- **ORM con Sequelize:** El uso de un ORM facilitó la gestión de modelos y relaciones sin escribir SQL manual, y proporcionó protección automática contra inyección SQL (RNF-04).
- **Colección Postman:** Documentar todos los endpoints en una colección exportable facilitó las pruebas y la entrega de evidencia.

### Gestión
- **División clara de responsabilidades:** Laura (DB + Dashboard), Sebastián (Auth + Financiero), Marlon (Frontend + Contratos) redujo dependencias y aceleró el desarrollo.
- **Kanban en GitHub Projects:** El tablero permitió visibilidad del avance sin reuniones diarias, compatible con la disponibilidad parcial del equipo.
- **Commits descriptivos:** El historial de Git es trazable y permite entender la evolución del sistema módulo a módulo.

---

## 4. Lo que se puede mejorar (Stop / Desafíos)

### Técnico
- **Gráficos del dashboard (RF-15):** El componente quedó con un placeholder `[Gráfico de Ingresos vs Mora]`. La integración de Chart.js o Recharts requería tiempo adicional que no se contempló en el sprint.
- **Generación de PDF para recibos (RF-11):** El endpoint genera los datos del recibo en formato JSON. La generación de un PDF descargable (con `pdfkit` o `puppeteer`) quedó fuera del alcance por restricciones de tiempo.
- **Despliegue en Azure (RNF-03, E-06):** El sistema funciona correctamente en entorno local con Docker, pero no se realizó el despliegue en Azure App Service con HTTPS. La configuración de variables de entorno y el manejo del `sleep mode` del tier gratuito requería tiempo adicional.
- **Flujo frontend para inquilinos (RF-02, RF-04):** El backend soporta el rol inquilino con filtrado de datos, pero el frontend no tiene páginas diferenciadas para este perfil.

### Gestión
- **Subestimación del módulo Dashboard:** Se estimaron 5 Story Points y 30 horas, pero la integración de gráficos dinámicos habría requerido al menos 10 puntos adicionales.
- **Configuración de red Docker:** El primer intento de despliegue falló porque los contenedores no compartían red. Se resolvió conectando manualmente el contenedor de BD a la red del proyecto.
- **Ausencia de pruebas automatizadas en main:** Los tests con Jest + Supertest fueron desarrollados en la rama `jdiaz3` pero no se mergearon a `main` antes de la entrega.

---

## 5. Lecciones Aprendidas

| # | Lección | Acción futura |
|---|---------|--------------|
| L-01 | Los gráficos del frontend requieren más tiempo del estimado por la curva de aprendizaje de librerías de visualización. | Estimar gráficos como módulo independiente con al menos 8 Story Points. |
| L-02 | Docker facilita el despliegue pero requiere conocimiento de redes de contenedores. | Documentar la configuración de red en el README desde el inicio. |
| L-03 | Las pruebas automatizadas desarrolladas en rama separada deben mergearse antes del cierre. | Incluir una tarea de merge de tests en el sprint de QA. |
| L-04 | La estimación de puntos de historia sin datos históricos subestima la complejidad real del frontend. | Usar analogía con proyectos anteriores o ajustar el factor de carga al alza en un 20%. |
| L-05 | Los conflictos de puertos entre proyectos Docker en la misma máquina generan tiempos de depuración no planeados. | Definir puertos únicos por proyecto desde el inicio y documentarlos. |

---

## 6. Métricas del Proyecto

### 6.1 Velocidad del equipo real

| Sprint | Módulo | Puntos planificados | Puntos entregados | Velocidad |
|--------|--------|--------------------|--------------------|-----------|
| Sprint 1 (Sem 8-9) | Contratos + Auth | 11 pts | 10 pts | 91% |
| Sprint 2 (Sem 10-11) | Financiero | 8 pts | 7 pts | 88% |
| Sprint 3 (Sem 12) | Dashboard + Infra | 5 pts | 3 pts | 60% |
| **Total** | | **24 pts** | **20 pts** | **83%** |

### 6.2 Tareas completadas por semana (Kanban)

| Semana | Issues cerrados | Issues abiertos |
|--------|----------------|----------------|
| 1-3 (Planeación) | 0 | 0 |
| 4-5 (Análisis) | 0 | 0 |
| 6-7 (Diseño) | 1 (DDL) | 9 |
| 8-9 (Sprint 1) | 3 | 6 |
| 10-11 (Sprint 2) | 3 | 3 |
| 12-13 (Sprint 3 + QA) | 1 | 2 |
| 14 (Cierre) | 0 | 2 |

### 6.3 Métricas de calidad del código

| Métrica | Valor |
|---------|-------|
| Archivos en repositorio | 28 archivos modificados en main |
| Líneas de código agregadas | +1.734 líneas (último merge) |
| Endpoints documentados en Postman | 15+ endpoints |
| Ramas creadas | 4 (main, jdiaz1, jdiaz3, feature/backend-modelos) |
| Pull Requests mergeados | 2 PRs formales |

---

## 7. Análisis de Riesgos — Materialización

| Riesgo identificado en PGP | ¿Se materializó? | Impacto |
|---------------------------|-----------------|---------|
| Disponibilidad limitada del equipo | Parcialmente | Redujo velocidad en Sprint 3 |
| Restricciones del tier gratuito de Azure | Sí | No se completó el despliegue en nube |
| Complejidad subestimada en módulos | Sí (Dashboard) | RF-15 quedó incompleto |
| Conflictos de integración de código | Sí (menor) | Resueltos con Git Flow |
| Sin backups automáticos | Aceptado | Mitigado con GitHub como respaldo |

---

## 8. Estado de Entregables Formales

| ID | Entregable | Estado | Observación |
|----|-----------|--------|-------------|
| E-01 | PMP | ✅ Entregado | Semana 3 |
| E-02 | SRS | ✅ Entregado | Semana 5 |
| E-03 | Mockups UI | ✅ Entregado | Semana 6-7 |
| E-04 | Modelo de BD (DDL) | ✅ Entregado | `backend/database/schema.sql` |
| E-05 | Código fuente | ✅ Entregado | GitHub: UDFJDC-IngenieriaSoftware/IS_202610_E2 |
| E-06 | Aplicación desplegada | ⚠️ Parcial | Funciona con Docker local; pendiente Azure |
| E-07 | Manual de usuario | ✅ Entregado | Ver documento adjunto |
| E-08 | Informe final / Postmortem | ✅ Este documento | Semana 14 |

---

## 9. Conclusiones

Arriendos360 logró implementar el núcleo funcional del MVP definido en el SRS: la gestión de contratos, el registro y seguimiento de pagos con detección de mora, el dashboard de indicadores clave y la autenticación diferenciada por roles. El sistema es funcional, reproducible con Docker y está documentado con una colección Postman completa.

Las principales brechas respecto al plan original corresponden a funcionalidades de presentación visual (gráficos del dashboard) y de infraestructura (despliegue en nube con HTTPS), que no comprometieron la funcionalidad core del sistema pero representan trabajo técnico pendiente para una versión futura.

El modelo iterativo e incremental adoptado demostró ser la decisión correcta: permitió entregar incrementos funcionales completos por módulo, protegiendo el valor del MVP ante las restricciones de tiempo del equipo.

---

*Documento generado como parte del cierre del proyecto académico Arriendos360 — Ingeniería de Software I — 2026.*
