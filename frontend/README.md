# Vitalia — Frontend del Sistema de Gestión Médica

Frontend en React + Vite para el taller del patrón Facade. Interfaz en español, diseño adaptable y conexión con la API REST de Spring Boot.

## Requisitos
- Node.js 20 o superior (incluye npm).
- Backend Spring Boot en ejecución para probar la integración real. Sin backend, la interfaz permite activar el **modo demostración** con datos locales simulados.

## Ejecutar en Visual Studio Code
1. Descomprime el ZIP y abre la carpeta `Clinica_Facade_Frontend` en VS Code.
2. Abre Terminal → Nueva terminal.
3. Ejecuta `npm install`.
4. Copia `.env.example` a `.env` y cambia `VITE_API_URL` por la URL de tu backend. Para backend local, deja `http://localhost:8080`.
5. Ejecuta `npm run dev`.
6. Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

## Compilar para producción
```bash
npm run build
npm run preview
```
La carpeta de salida es `dist`.

## Desplegar en Vercel
1. Sube esta carpeta a un repositorio GitHub.
2. En Vercel, importa el repositorio.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. En Settings → Environment Variables crea `VITE_API_URL` con la URL pública del backend.
5. Redeploy para que Vite incorpore la variable.

También puedes desplegar con la CLI:
```bash
npm install -g vercel
vercel
vercel --prod
```

## API esperada
La aplicación intenta consumir los endpoints descritos en el taller:
- `POST /api/clinica/paciente`
- `POST /api/clinica/cita`
- `GET /api/clinica/historia/{pacienteId}`
- `POST /api/clinica/prescripcion`
- `POST /api/clinica/laboratorio`
- `GET /api/clinica/medicos?especialidad=`

Los nombres de campos exactos del backend pueden variar. La capa `src/api.js` centraliza las peticiones para que se adapten fácilmente. Para registrar/consultar el perfil, inicio de sesión y algunas vistas, la API del taller no define endpoints específicos; por eso el inicio de sesión de la interfaz es una sesión de demostración/local hasta que se agregue autenticación al backend.

## Modo demostración
En la pantalla de acceso, pulsa **Explorar demo**. Permite recorrer el dashboard, reservar citas, consultar la historia simulada y visualizar laboratorios sin requerir el backend. Los cambios demo se mantienen en el estado del navegador mientras la página está abierta; no son datos clínicos reales.

## Importante
El taller exige que backend y frontend estén desplegados en producción. Este ZIP entrega el frontend listo para ejecutar y desplegar, pero no lo despliega automáticamente ni reemplaza la implementación/despliegue del backend Spring Boot. La URL real de la API debe configurarse antes de la entrega final.