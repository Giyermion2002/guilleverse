# Proyecto: Guilleverse - Juego Web (Web Edition)

## 🌌 Visión General
Un juego multijugador basado en turnos donde los jugadores eligen personajes del "Guilleverse" y compiten en minijuegos aleatorios basados en colores. El sistema utiliza códigos de sala únicos para unir a los jugadores en una experiencia sincronizada en tiempo real.

## 🎨 Estética y Diseño
- **Estilo:** Gamer, vibrante, efectos de rayos/energía, colores altamente saturados.
- **Inspiración Principal:** Portada del juego (`portada.png`).
- **Paleta de Colores:** Cuatro colores fundamentales (Verde, Azul, Rojo, Amarillo) integrados sobre un fondo oscuro cósmico/mágico.
- **Tipografía:** 'serif'.

## 🕹 Flujo de Pantallas

### 1. Registro y Gestión de Sala (Lobby)
- **Modo Creación (Host):**
    - Introducción de nombre.
    - **Selector de Personajes:** Carrusel con los 8 avatares distintivos de la portada.
    - Código de Sala: Formato descriptivo (ej: `XXXX`).
    - Control de Host: Botón "EMPEZAR PARTIDA" activo tras alcanzar el quórum (mínimo 3 jugadores).
- **Modo Unión (Jugador):**
    - Introducción de nombre y selección de personaje.
    - Input para código de sala.
- **Interfaz Común:** La mítica portada como fondo con transparencia ajustada para legibilidad.

### 2. Panel de Turno y Acción
- Gestión de estados "Esperando..." y "Tu Turno".
- **Social:** Chat integrado para "trash-talking" o coordinación.
- **Side Panel:** Lista de jugadores con sus avatares, puntos actuales y estado de conexión.

### 3. El Selector Mágico (D20 / Ruleta)
- Animación central impactante al iniciar cada ronda.
- Selección aleatoria de uno de los 4 colores del Guilleverse.
- Efectos de partículas y rayos al confirmar la selección.

### 4. Interfaz de Minijuego
- Tematización automática según el color seleccionado.
- **Botón de Instrucciones:** Acceso rápido a las reglas del minijuego (imagen específica).
- Área de juego interactiva central.

### 5. Ranking y Gloria Final
- Podio visual para los ganadores.
- Desglose de puntuación por rondas.
- Opción de "Siguiente partida" gestionada por el Host.

## ✨ Mejoras y Puntos de Pulido (Pendientes)

### 🔊 SFX y Feedback Auditivo
- **Ambiente:** Sonido de baja frecuencia (magical hum) constante en el fondo.
- **Interacción:** Sonidos de "click" metálicos o mágicos al interactuar con botones.
- **Rayo de Unión:** Efecto sonoro de trueno/energía cuando un nuevo jugador se conecta.
- **Dado:** Sonido realista de rodar un D20 al iniciar la selección.

### 🎭 Avatares con Efectos
- **Brillo de Estado:** El borde del avatar brilla con el color del equipo (Rojo, Azul, etc.) cuando es su turno.
- **Micro-animaciones:** Los personajes "vibran" o se mueven sutilmente cuando están listos para jugar.

### 🗨 Chat con Emojis Personalizados
- **Reacciones Rápidas:** Botones de emojis grandes para enviar reacciones instantáneas durante los turnos de otros.
- **Log de Eventos:** El chat mezcla mensajes de jugadores con anuncios automáticos del sistema.

### ⏳ Indicadores de "Piping"
- **Generando Suspense:** Animaciones de carga temáticas (rayos cargando) mientras el servidor determina el siguiente color o juego.
- **Transiciones:** Pantallas de carga rápidas entre el Lobby y el inicio del Dado.

---
