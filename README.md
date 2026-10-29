# Vibrant Module Studio

Ayudame haciendo una web asi con todos esos modulos que te pido en mi .md neceisto que el colores sean
#FF6711 naranja
#FFFFFF Blanco
#000000 Negro
#4FC8DC Azul
receurda el md tiene todos los modulos que necesito quiero que se pueda colocar en modo nocturno, quiero ver como se veeria cada modulo porfa por dentro

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vibrant-module-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fa4c3ed4-b734-41fa-962f-421923d00de1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
copy .env.example .env.local
npm run dev
```

`VITE_API_URL` es obligatoria para cualquier módulo conectado al backend. El archivo `.env.local` no se versiona y no debe contener secretos de servidores de terceros.

Antes de entregar cambios, ejecuta:

```sh
npm run lint
npm run test
npm run build
```

## Aplicación de escritorio (Windows)

La misma interfaz web también puede ejecutarse como aplicación de escritorio con Tauri.

```sh
# Ejecuta Piddop como aplicación de escritorio durante el desarrollo.
npm run desktop:dev

# Genera el ejecutable e instalador de Windows.
npm run desktop:build

# Genera solamente el instalador .exe de Windows (recomendado).
npm run desktop:build:exe
```

Se requiere Rust estable (instalado mediante `rustup`) y las herramientas de compilación de
Microsoft C++ para Windows. El instalador se genera en `src-tauri/target/release/bundle/`.
