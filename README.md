# Aprende PSP · psp-exam-prep

Web de estudio intensivo para el examen en papel de **Programación de Servicios y Procesos** (Java): hilos, condiciones de carrera, `synchronized`, `Semaphore`, `wait`/`notify`/`notifyAll` y sockets TCP cliente-servidor.

Diseño inspirado en [aprenderust.dev](https://aprenderust.dev) y [aprendesql.dev](https://aprendesql.dev): índice lateral por bloques con progreso, lecciones cortas con secciones numeradas, ejercicios en pestañas al final de cada lección y modo claro/oscuro.

## Contenido

| Bloque | Lecciones | Tiempo |
|---|---|---|
| 00 · Antes de empezar | Calentamiento con los tramos clave del vídeo de clase | 12 min |
| 01 · Concurrencia y carreras | Hilos, `contador++` no atómico, `synchronized` (método y bloque), `Semaphore` | 23 min |
| 02 · wait / notify y trampas | Monitor (con simulador interactivo), IllegalMonitorStateException, notify perdido, monitor equivocado, condición no actualizada, Ejercicio 8b y sus variantes, turnos con 2 y 3 hilos | 32 min |
| 03 · Sockets TCP | `ServerSocket`/`accept`/`Socket`, streams y `flush()`, SHA-256, bugs de `Cliente` y `Server` | 17 min |
| 04 · Supervivencia | Checklist para el folio, plantilla de respuesta, vocabulario y **simulacro** de 10 preguntas con nota | 20 min |

- 44 ejercicios (predicción de salida y redacción) con **respuesta modelo** lista para el examen.
- Simulador paso a paso del monitor (Entry Set / dueño / Wait Set) con 3 escenarios.
- El progreso se guarda en el `localStorage` del navegador (botón «reiniciar» para borrarlo).

## Estructura

```
psp-exam-prep/
├── src/
│   ├── App.jsx                 # layout, rutas por hash (#/leccion), cabecera con progreso
│   ├── progress.js             # progreso y tema (localStorage)
│   ├── index.css               # Tailwind v4 + tokens de color claro/oscuro + resaltado Java
│   ├── components/
│   │   ├── CodeBlock.jsx       # Prism (Java) con líneas resaltadas/erróneas/correctas
│   │   ├── MonitorSim.jsx      # simulador del monitor
│   │   ├── Exercises.jsx       # ejercicios tipo test y de redacción
│   │   ├── ExamPage.jsx        # simulacro con cronómetro y nota
│   │   ├── Sidebar.jsx · Home.jsx · ui.jsx
│   └── content/                # b0..b4.jsx (lecciones) + exam.jsx (simulacro) + index.js
├── Dockerfile                  # build multi-stage: node → nginx:alpine
├── docker-compose.yml          # expone 8080:80
└── nginx.conf
```

## Desplegar con Docker Compose

```bash
docker compose up -d --build
```

Abre http://localhost:8080 (o `http://IP-del-servidor:8080`).

**Cambiar el puerto:** edita `docker-compose.yml` y cambia el número de la izquierda, por ejemplo `"3000:80"`, y vuelve a lanzar `docker compose up -d --build`.

Parar y borrar el contenedor:

```bash
docker compose down
```

## Desarrollo local

Requiere Node.js 20 o superior.

```bash
npm install && npm run dev
```

Abre http://localhost:5173. Para generar los estáticos de producción en `dist/`: `npm run build` (y `npm run preview` para probarlos).

## Notas sobre el temario

El contenido sigue el código **real** de `PSP.pdf`. En tres puntos el código de clase difiere de cómo se suele contar, y la web lo trata así:

- `Server` enlaza a `0.0.0.0` con backlog 1000. La versión con `192.168.1.148` y backlog 10 se explica como variante.
- En `Ejercicio8b`, ni el `while` ni el `synchronized` del `main` están vacíos: la versión del PDF **funciona**. Las versiones con llaves vacías se analizan como «variantes trampa».
- El `while` de `Cliente` no tiene ninguna llave mal puesta en el PDF. La llave mal colocada también se trata como variante trampa (error de ámbito de `msg`).
