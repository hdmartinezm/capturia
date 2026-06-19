# Plan Técnico: Evolución de Capturia

> Documento de referencia para la arquitectura e implementación de nuevas funcionalidades.
> Última actualización: Junio 2026

## Resumen Ejecutivo

Capturia actualmente es una aplicación web Next.js con overlay de gráficos controlados por voz. La evolución propuesta la transforma en una **cámara virtual multiplataforma** que funciona nativamente en Zoom/Teams/Meet.

---

## 1. Análisis Técnico del Impacto

### Feature 1: Cámara Virtual en Zoom/Teams/Meet

| Aspecto | Impacto |
|---------|---------|
| **Valor técnico** | Elimina fricción de compartir pantalla; el host ve Capturia como una cámara más |
| **Stakeholders** | DevOps (distribución de drivers), Seguridad (firma de código), QA (matrix de plataformas) |
| **Desafío principal** | Requiere driver a nivel de kernel (Windows/macOS) que emule dispositivo de video |

**Arquitectura requerida:**
```
┌─────────────────────────────────────────────────────────┐
│                    Aplicación Capturia                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Compositor  │→ │ Frame Buffer │→ │ Virtual Camera│  │
│  │ (WebGPU)    │  │ (SharedMem)  │  │ Driver        │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────────────────────┐
              │  Sistema Operativo          │
              │  /dev/video0 (Linux)        │
              │  AVFoundation (macOS)       │
              │  DirectShow (Windows)       │
              └─────────────────────────────┘
                            ↓
              ┌─────────────────────────────┐
              │  Zoom / Teams / Meet        │
              │  (ve "Capturia Camera")     │
              └─────────────────────────────┘
```

### Feature 2: Presentaciones con Datos en Tiempo Real

| Aspecto | Impacto |
|---------|---------|
| **Valor técnico** | Slides + overlays dinámicos + datos de APIs externas en un solo stream |
| **Stakeholders** | Backend (conectores de datos), Frontend (renderizado de slides) |
| **Desafío principal** | Parsing de formatos (PPTX, PDF, Google Slides) + sincronización de datos |

### Feature 3: Multiplataforma sin Limitaciones de Navegador

| Aspecto | Impacto |
|---------|---------|
| **Valor técnico** | Funciona en Safari, Firefox, y como app nativa |
| **Stakeholders** | Frontend (polyfills), Mobile (React Native / Electron) |
| **Desafío principal** | Web Speech API no existe en Firefox/Safari; MediaRecorder varía |

### Feature 4: Voz sin Extensiones

| Aspecto | Impacto |
|---------|---------|
| **Valor técnico** | Zero-friction onboarding; funciona out-of-the-box |
| **Stakeholders** | Backend (Whisper/Groq ya implementado), Infra (costos de transcripción) |
| **Desafío principal** | Ya resuelto con Groq Whisper - solo falta optimizar detección de silencio |

### Feature 5: Sin Instalación de Complementos

| Aspecto | Impacto |
|---------|---------|
| **Valor técnico** | Adopción instantánea; reduce soporte técnico |
| **Stakeholders** | Producto (trade-offs de funcionalidad), Marketing (messaging) |
| **Desafío principal** | Conflicto con Feature 1 (cámara virtual SÍ requiere driver) |

---

## 2. Arquitectura de Integración

### Diagrama de Arquitectura Objetivo

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              CAPTURIA PLATFORM                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │   WEB APP    │   │ DESKTOP APP  │   │  MOBILE APP  │   │    API     │  │
│  │  (Next.js)   │   │  (Electron)  │   │(React Native)│   │ (Headless) │  │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └─────┬──────┘  │
│         │                  │                  │                  │         │
│         └──────────────────┴──────────────────┴──────────────────┘         │
│                                    │                                       │
│                        ┌───────────▼───────────┐                          │
│                        │     CORE ENGINE       │                          │
│                        │  ┌─────────────────┐  │                          │
│                        │  │ Overlay Renderer│  │                          │
│                        │  │ (Canvas/WebGPU) │  │                          │
│                        │  └────────┬────────┘  │                          │
│                        │  ┌────────▼────────┐  │                          │
│                        │  │ Slide Engine    │  │                          │
│                        │  │ (PDF/PPTX/GSlide│  │                          │
│                        │  └────────┬────────┘  │                          │
│                        │  ┌────────▼────────┐  │                          │
│                        │  │ Data Connectors │  │                          │
│                        │  │ (REST/WS/GraphQL│  │                          │
│                        │  └────────┬────────┘  │                          │
│                        │  ┌────────▼────────┐  │                          │
│                        │  │ Voice Pipeline  │  │                          │
│                        │  │ (Groq Whisper)  │  │                          │
│                        │  └─────────────────┘  │                          │
│                        └───────────────────────┘                          │
│                                    │                                       │
│         ┌──────────────────────────┼──────────────────────────┐           │
│         │                          │                          │           │
│  ┌──────▼──────┐           ┌───────▼───────┐          ┌───────▼───────┐  │
│  │ Browser Tab │           │ Virtual Camera│          │ RTMP/WebRTC   │  │
│  │ (Web only)  │           │ Driver        │          │ Stream Output │  │
│  └─────────────┘           │ (Desktop only)│          └───────────────┘  │
│                            └───────────────┘                              │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
   ┌───────────┐              ┌───────────┐              ┌───────────┐
   │   ZOOM    │              │   TEAMS   │              │   MEET    │
   │ (Camera)  │              │ (Camera)  │              │ (Camera)  │
   └───────────┘              └───────────┘              └───────────┘
```

### Integración con Plataformas Externas

#### Zoom/Teams/Meet (Cámara Virtual)

**Mecanismo técnico:**
- **macOS:** Plugin de CoreMediaIO (`CMIOExtension`) - requiere Xcode, firma de Apple Developer
- **Windows:** DirectShow Virtual Camera Filter - requiere certificado de firma de código
- **Linux:** V4L2 loopback device (`/dev/video*`)

**Flujo de datos:**
```
Capturia App → Shared Memory Buffer → Virtual Camera Driver → Video Device → Zoom/Teams/Meet
     │                                                              │
     └── 30fps RGBA frames ──────────────────────────────────────────┘
```

#### Google Slides / PowerPoint / PDF

**Opciones de integración:**

| Formato | Método | Limitaciones |
|---------|--------|--------------|
| PDF | pdf.js (ya integrado) | Solo lectura |
| PPTX | Aspose.Slides / SheetJS | Licencia comercial |
| Google Slides | Google Slides API | Requiere OAuth |

---

## 3. Priorización Técnica

### Matriz de Priorización

| Feature | Complejidad | Dependencias | Riesgo | Valor | **Prioridad** |
|---------|-------------|--------------|--------|-------|---------------|
| F4: Voz sin extensiones | ✅ Baja | Ninguna | Bajo | Alto | **1 - Ya implementado** |
| F2: Presentaciones + datos | 🟡 Media | F4 | Medio | Alto | **2** |
| F3: Multiplataforma | 🟡 Media | F4 | Medio | Alto | **3** |
| F5: Sin complementos (web) | ✅ Baja | F3, F4 | Bajo | Alto | **4** |
| F1: Cámara virtual | 🔴 Alta | F2, F3 | Alto | Muy Alto | **5** |

### Roadmap Recomendado

```
FASE 1 (Actual - Completado)
├── ✅ Voz con Groq Whisper
├── ✅ Overlays controlados por voz
└── ✅ Despliegue en Amplify

FASE 2 (4-6 semanas)
├── Slide Engine (PDF viewer mejorado)
├── Data Connectors (REST APIs externas)
└── Sincronización slides ↔ overlays

FASE 3 (6-8 semanas)
├── App Electron (Windows + macOS)
├── Whisper local (whisper.cpp) para offline
└── Polyfills para Safari/Firefox

FASE 4 (8-12 semanas)
├── Virtual Camera Driver (macOS primero)
├── Firma de código y notarización Apple
├── Instalador con driver signing

FASE 5 (12+ semanas)
├── Virtual Camera Windows
├── Auto-update framework
└── Enterprise deployment (MDM)
```

---

## 4. Flujos Técnicos

### Flujo A: Presentación con Datos en Tiempo Real

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Usuario dice: "Muestra la slide 3 con los ingresos del Q4"             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. VOICE PIPELINE                                                       │
│    Audio → Groq Whisper → "Muestra la slide 3 con los ingresos del Q4" │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. AI INTENT PARSER (Gemini/Claude)                                     │
│    {                                                                    │
│      "action": "navigate_slide",                                        │
│      "slide": 3,                                                        │
│      "data_query": { "metric": "revenue", "period": "Q4" }              │
│    }                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│ 3A. SLIDE ENGINE          │       │ 3B. DATA CONNECTOR        │
│     render(slide: 3)      │       │     fetch("/api/metrics") │
│     → Canvas frame        │       │     → { revenue: "$2.1M" }│
└───────────────────────────┘       └───────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. COMPOSITOR                                                           │
│    slide_frame + overlay_frame + data_overlay → final_frame            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. OUTPUT                                                               │
│    → Browser canvas (web)                                               │
│    → Virtual camera buffer (desktop)                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flujo B: Cámara Virtual en Zoom

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CAPTURIA DESKTOP APP                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                 │
│  │  Webcam    │    │  Slides    │    │  Overlays  │                 │
│  │  Input     │    │  Engine    │    │  Layer     │                 │
│  └─────┬──────┘    └─────┬──────┘    └─────┬──────┘                 │
│        │                 │                 │                         │
│        └─────────────────┼─────────────────┘                         │
│                          ▼                                           │
│                 ┌────────────────┐                                   │
│                 │  GPU Compositor│                                   │
│                 │  (WebGPU/Metal)│                                   │
│                 └────────┬───────┘                                   │
│                          │ 30fps BGRA                                │
│                          ▼                                           │
│                 ┌────────────────┐                                   │
│                 │ Shared Memory  │                                   │
│                 │ Ring Buffer    │                                   │
│                 └────────┬───────┘                                   │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │ IPC
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    VIRTUAL CAMERA DRIVER                             │
├──────────────────────────────────────────────────────────────────────┤
│  macOS: CMIOExtension (Camera Extension)                             │
│  Windows: DirectShow Source Filter                                   │
│  Linux: V4L2 Loopback                                                │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    OPERATING SYSTEM                                  │
│  "Capturia Camera" aparece en lista de cámaras del sistema          │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌─────────┐     ┌─────────┐     ┌─────────┐
      │  Zoom   │     │  Teams  │     │  Meet   │
      │ Selects │     │ Selects │     │ Selects │
      │"Capturia│     │"Capturia│     │"Capturia│
      │ Camera" │     │ Camera" │     │ Camera" │
      └─────────┘     └─────────┘     └─────────┘
```

---

## 5. Desafíos Técnicos Anticipados

### 🔴 Críticos

| Desafío | Descripción | Mitigación |
|---------|-------------|------------|
| **Driver signing (Windows)** | Microsoft requiere certificado EV (~$500/año) + proceso de WHQL para drivers de cámara | Usar OBS Virtual Camera como fallback (requiere OBS instalado) |
| **Apple notarization** | Extensiones de cámara requieren Developer ID + notarización + posible revisión manual | Aplicar temprano; tener cuenta de empresa Apple |
| **Latencia de composición** | GPU→SharedMem→Driver debe ser <33ms para 30fps sin tearing | Usar triple buffering; considerar Metal/Vulkan directo |

### 🟡 Significativos

| Desafío | Descripción | Mitigación |
|---------|-------------|------------|
| **PPTX parsing** | Formato complejo con animaciones, fuentes embebidas, SmartArt | Usar LibreOffice headless como fallback para conversión |
| **Safari WebRTC** | Algunas APIs de captura difieren en Safari | Feature detection + polyfills específicos |
| **Whisper local** | whisper.cpp requiere ~1GB RAM y CPU significativo | Ofrecer como opción; mantener Groq como default |

### 🟢 Manejables

| Desafío | Descripción | Mitigación |
|---------|-------------|------------|
| **Electron bundle size** | App puede crecer a 200MB+ con dependencias | Usar electron-builder con ASAR; lazy-load módulos |
| **Auto-update** | Diferentes mecanismos por OS | electron-updater con Squirrel (Win) / Sparkle (mac) |

---

## 6. Validación Técnica Necesaria

### Pruebas de Concepto Requeridas (antes de especificaciones)

#### PoC 1: Virtual Camera Driver (Prioridad Alta)
```
Objetivo: Validar que podemos enviar frames desde Electron a Zoom
Herramientas:
  - macOS: Xcode + CMIOExtension template
  - Windows: Visual Studio + DirectShow BaseClasses
Criterio de éxito: Zoom muestra "Capturia Camera" con frames de prueba
Duración estimada: 2-3 días
```

#### PoC 2: Slide Rendering Pipeline (Prioridad Media)
```
Objetivo: Renderizar PDF/PPTX a canvas con overlays superpuestos
Herramientas:
  - pdf.js (ya integrado)
  - pptxgenjs o Aspose trial
Criterio de éxito: Slide 1920x1080 renderizada a 30fps con overlay animado
Duración estimada: 1-2 días
```

#### PoC 3: Whisper Local (Prioridad Baja)
```
Objetivo: Transcripción offline en Electron sin servidor
Herramientas:
  - whisper.cpp con bindings Node (whisper-node)
  - Modelo small o base
Criterio de éxito: Transcripción en <2s para audio de 5s en M1 Mac
Duración estimada: 1 día
```

### Información Técnica Crítica a Investigar

| Pregunta | Por qué importa | Cómo obtener respuesta |
|----------|-----------------|------------------------|
| ¿Teams/Meet detectan y bloquean cámaras virtuales? | Podría invalidar Feature 1 | Probar con OBS Virtual Camera en cuentas enterprise |
| ¿Cuál es el tamaño máximo de PPTX que usuarios suben? | Afecta memoria y parsing | Encuesta a usuarios beta o analytics |
| ¿Qué % de usuarios usan Safari/Firefox? | Prioriza inversión en polyfills | Analytics de la web actual |
| ¿Electron + driver funcionan en macOS Sonoma con Gatekeeper? | Puede requerir pasos extra de instalación | Probar en VM limpia |

---

## 7. Decisiones Arquitectónicas Pendientes

| Decisión | Opciones | Recomendación | Necesita validación |
|----------|----------|---------------|---------------------|
| Framework desktop | Electron vs Tauri vs nativo | **Electron** (ecosistema más maduro para video) | No |
| Virtual camera impl | Driver propio vs OBS como dependencia | **Driver propio** (mejor UX, pero PoC primero) | Sí |
| Slide format primario | PDF-first vs PPTX-first | **PDF-first** (pdf.js ya funciona) | No |
| Data connectors | REST polling vs WebSocket vs GraphQL | **REST + WebSocket** según caso de uso | No |
| Distribución | Direct download vs App Store | **Direct download** (más control sobre drivers) | No |

---

## 8. Estado Actual del Proyecto

### Implementado ✅
- [x] Aplicación web Next.js desplegada en AWS Amplify
- [x] Overlays controlados por voz (LowerThird, MetricsPanel, etc.)
- [x] Transcripción con Groq Whisper (gratis, alta precisión)
- [x] Detección de silencio para auto-envío
- [x] Modelo Gemini 2.5 Flash para interpretación de comandos
- [x] Interfaz completamente en español

### En Progreso 🔄
- [ ] Optimización de detección de silencio
- [ ] Mejoras de UX en feedback de grabación

### Pendiente 📋
- [ ] Slide Engine mejorado
- [ ] Data Connectors
- [ ] App Electron
- [ ] Virtual Camera Driver

---

## 9. URLs y Recursos

| Recurso | URL |
|---------|-----|
| Producción | https://main.d2ouy6ulne5l7q.amplifyapp.com |
| Studio | https://main.d2ouy6ulne5l7q.amplifyapp.com/studio |
| Repositorio | https://github.com/hdmartinezm/capturia |
| Amplify Console | https://us-east-1.console.aws.amazon.com/amplify/apps/d2ouy6ulne5l7q |
| Groq Console | https://console.groq.com |
| Google AI Studio | https://aistudio.google.com |

---

## Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| 2026-06-19 | Documento inicial creado |
| 2026-06-19 | Integración de Groq Whisper completada |
| 2026-06-19 | Mejoras en detección de silencio |
