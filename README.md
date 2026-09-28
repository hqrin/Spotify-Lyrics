# 🎵 Discord Spotify Lyrics

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Discord](https://img.shields.io/badge/Discord-Selfbot-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com)
[![Spotify](https://img.shields.io/badge/Spotify-API-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](https://developer.spotify.com)
[![License](https://img.shields.io/badge/License-MIT-darkred?style=for-the-badge)](LICENSE)

**✨ Sincroniza Discord con Spotify en tiempo real - Letras traducidas a 10 idiomas ✨**

</div>

---

## 🚀 Características Principales

###  Sincronización Discord
- Actualiza tu `custom status` con la línea actual de la canción
- Rotación automática cada 2-3 segundos con jitter dinámico
- Anti-ban pasivo implementado (User-Agent real, cooldown inteligente)

###  Modo Terminal Visual
- Letras con estilo ASCII (figlet) + 4 esquemas de color
- Colores: **Arcoíris** | **Cian Neón**  | **Verde Matrix** | **Rosa Fucsia** 
- Fuentes: Standard, Big, Mini (perfecto para líneas largas)

### Sistema de Traducción **[NUEVO]**
- Soporte para **10 idiomas**: 🇺🇸 English, 🇪🇸 Español, 🇫🇷 Français, 🇵🇹 Português, 🇩🇪 Deutsch, 🇮🇹 Italiano, 🇯🇵 日本語, 🇰🇷 한국어, 🇷🇺 Русский, 🇨🇳 中文
- Caché inteligente para evitar llamadas API duplicadas
- Muestra letra original + traducida simultáneamente

###  Menú de Configuración **[NUEVO]**
- Habilitar/deshabilitar traductor dinámicamente
- Seleccionar idioma en tiempo real
- Indicador de estado en el menú principal
- Persistencia de configuración en sesión

###  Anti-Ban Inteligente
- Headers reales de navegador
- Cooldown dinámico 2-3 segundos
- Jitter de ±500ms para simular latencia humana
- Solo usa endpoints oficiales de Discord

---

## 📋Requisitos

- **Node.js** 18.x o superior
- **npm** o yarn
- Cuenta de **Discord** (token de usuario, no de bot)
- Aplicación en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) (Client ID + Secret)

---

## 🔧 Instalación & Setup

### Clonar el repositorio
```bash
git clone https://github.com/Hellsa/discord-spotify-lyrics.git
cd discord-spotify-lyrics
```

###  Instalar dependencias
```bash
npm install
```

###  Configurar variables de entorno
Crea un archivo `.env` en la raíz (o copia desde `.env.example`):

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
# Discord (token de usuario, NO de bot)
DISCORD_TOKEN=your_discord_user_token_here

# Spotify API credentials
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
```

> ⚠️ **Aviso:** El uso de tokens de usuario en Discord viola sus Términos de Servicio. Este proyecto es solo para fines educativos. Úsalo bajo tu propia responsabilidad.

### 4️⃣ Ejecutar la aplicación
```bash
npm start
```
---

## 🎮 Menú Interactivo

Al ejecutar `npm start` verás un menú con opciones:

```

[01]  Discord Lyrics Mode
[02]   Terminal Lyrics Mode  
[03]   Settings & Translator
```

###  Modo 1: Discord Lyrics
- Envía líneas de la canción a tu estado personalizado
- Funciona en segundo plano (silencioso)
- Ideal para que tus amigos vean lo que escuchas

###  Modo 2: Terminal Lyrics
- Muestra las letras en la consola con estilo visual
- Personaliza colores y fuentes
- Perfecto para streaming o segunda pantalla

**Opciones disponibles:**
| Opción | Descripción |
|--------|-------------|
| **Color** | Arcoíris • Cian  • Matrix  • Rosa  |
| **Fuente** | Standard • Big • Mini |

###  Modo 3: Settings & Translator **[NUEVO]**
- **Habilitar/Deshabilitar Traductor** ✅ ❌
- **Seleccionar Idioma** (10 opciones disponibles)
- Persistencia en la sesión actual
- Muestra estado: `Traductor: HABILITADO (Español)` o `Traductor: DESHABILITADO`

---

## 📁 Estructura del Proyecto

```
discord-spotify-lyrics/
│
├── src/
│   ├── config/
│   │   └── index.js              # Configuración centralizada (env variables)
│   │
│   ├── services/
│   │   ├── spotify.js            # OAuth 2.0 y obtención de canción actual
│   │   ├── discord.js            # Actualización de custom_status
│   │   ├── lyrics.js             # Obtención y parseo de letras (lrclib)
│   │   └── translator.js         # Traducción multiidioma (MyMemory API) ✨
│   │
│   ├── ui/
│   │   ├── menu.js               # Menús interactivos + Settings ✨
│   │   └── render.js             # Renderizado visual en terminal
│   │
│   ├── app.js                    # Lógica principal y orquestación
│   └── index.js                  # Punto de entrada modular
│
├── .env.example
├── .gitignore
├── index.js                      # Entry point (backward compatibility)
├── package.json
├── LICENSE
└── README.md
```

### 🔑 Servicios Principales

| Servicio | Función |
|----------|---------|
| **config** | Lee y valida variables de entorno (.env) |
| **spotify** | Autenticación OAuth + obtiene canción actual |
| **discord** | PATCH a custom_status con anti-ban |
| **lyrics** | Consulta lrclib.net y parsea LRC format |
| **translator** | Traducción con caché (10 idiomas) ✨ |
| **ui/menu** | Menú interactivo + Settings ✨ |
| **ui/render** | Renderizado visual con chalk + figlet |
---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| ❌ Invalid token Discord | Verifica que sea token de **usuario** (empieza por ND... o MD...). **No uses token de bot**. |
| ❌ Spotify 401 Unauthorized | Regenera tu Client Secret en [Spotify Dashboard](https://developer.spotify.com/dashboard) |
| ❌ No aparece estado en Discord | Activa en Ajustes > Privacidad > "Mostrar actividad actual" |
| ❌ Letras muy largas | Cambia la fuente a **Mini** desde el menú Terminal Mode |
| ❌ Traductor no funciona | Verifica tu conexión a internet (usa API MyMemory Translated.net) |
| ❌ No se autentica Spotify | Asegúrate que el navegador se abre automáticamente en http://127.0.0.1:8888 |

---

##  Características Técnicas

###  Seguridad & Anti-Ban
- ✅ User-Agent real de navegador
- ✅ Cooldown dinámico 2500ms ± 1200ms jitter
- ✅ Solicitud HTTPS con headers oficiales
- ✅ Respeta rate limits de Discord y Spotify

###  Rendimiento
-  Polling cada 500ms (configurable)
-  Caché de traducciones en memoria
-  Sincronización inteligente (solo actualiza si cambió la línea)
-  Gestión automática de reconexión

###  Integraciones
- **Spotify Web API** - OAuth 2.0 Flow
- **Discord API v9** - Custom Status PATCH
- **lrclib.net** - Base de datos de letras sincronizadas
- **MyMemory Translated.net** - Traducción automática (10 idiomas)
---

## 📄 Licencia & Contribuciones

Este proyecto se distribuye bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

### 🤝 Contribuir
Las contribuciones son bienvenidas mediante **Pull Requests**. 

Para cambios importantes:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feat/amazing-feature`)
3. Commit con formato claro (`git commit -m "feat: descripcion del cambio"`)
4. Push a la rama (`git push origin feat/amazing-feature`)
5. Abre un Pull Request

---

## 📝 Roadmap

- [ ] Persistencia de settings entre sesiones (config file)
- [ ] Rate limiting para traductor
- [ ] Soporte para más fuentes ASCII
- [ ] Sincronización con queue de Spotify
- [ ] Interfaz web (dashboard)
- [ ] Docker support

---

<div align="center">

**Hecho con ❤️ para Discord y Spotify lovers**

[⬆ Volver al inicio](#-discord-spotify-lyrics)

</div>

Al contribuir, aceptas que tu código pase a ser MIT licensed.

Para cambios grandes, abre primero un Issue para discutirlos.

👤 Author
Hellsa – GitHub

Hecho con ❤️ y caffeine. No afiliado a Discord Inc. ni a Spotify AB.