# 🔐 Guía de Configuración - Google Firebase Authentication

## PASO 1: Crear un Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"**
3. Nombre del proyecto: `vet-link` (o el que prefieras)
4. Haz clic en **"Continuar"**
5. Acepta los términos y haz clic en **"Crear proyecto"**
6. Espera a que se complete la creación

---

## PASO 2: Registrar tu Aplicación Web

1. En la pantalla del proyecto, haz clic en el icono **</> (Web)**
2. Nombre de la app: `Vet-Link Angular`
3. Haz clic en **"Registrar app"**
4. **Copia la configuración** que aparece:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. **Reemplaza los valores** en el archivo:
   - `src/app/core/config/firebase.config.ts`

---

## PASO 3: Habilitar Google Authentication

1. En el menú lateral, ve a **"Build" → "Authentication"**
2. Haz clic en **"Comenzar"**
3. En la pestaña **"Proveedores"**, haz clic en **"Google"**
4. Activa la opción (toggle azul)
5. Completa el formulario:
   - **Nombre de proyecto público**: `Vet-Link`
   - **Email de soporte**: Tu email
6. Haz clic en **"Guardar"**

---

## PASO 4: Configurar Dominios Autorizados

1. En Authentication → Pestaña **"Settings"**
2. Desplázate a **"Authorized domains"**
3. Agregar dominios:
   - `localhost` (para desarrollo local)
   - `127.0.0.1` (para desarrollo local)
   - Tu dominio en producción (ej: `tudominio.com`)

---

## PASO 5: Obtener Google OAuth Credentials (Opcional - para mejor control)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto creado en Firebase
3. Ve a **"APIs & Services" → "Credentials"**
4. Las credenciales se crean automáticamente, pero puedes revisar la configuración OAuth si lo necesitas

---

## ✅ Instalación de Dependencias

Ya hemos ejecutado:
```bash
npm install firebase
```

---

## 🔑 Archivos Actualizados

✓ `src/app/core/config/firebase.config.ts` - Configuración de Firebase
✓ `src/app/core/services/auth.service.ts` - Servicio de autenticación con Google
✓ `src/app/features/login/login.ts` - Componente de login actualizado
✓ `src/app/features/login/login.html` - Template con botón de Google
✓ `src/app/features/login/login.css` - Estilos para botón de Google

---

## 🚀 Próximos Pasos

1. **Completa la configuración de Firebase** (pasos 1-5 arriba)
2. **Reemplaza los valores** en `firebase.config.ts`
3. **Ejecuta la aplicación**:
   ```bash
   npm start
   ```
4. **Prueba el login con Google** en `http://localhost:4200`

---

## 🐛 Troubleshooting

### Error: "Sign-in method is not enabled"
→ Asegúrate de habilitar Google en Authentication → Providers

### Error: "Unauthorized domain"
→ Agrega `localhost` a los dominios autorizados en Settings

### Error: "The popup has been closed by the user"
→ Es normal si cierras el popup de Google sin completar el login

### Error de CORS
→ Firebase maneja CORS automáticamente, no debería haber problemas

---

## 📱 Datos del Usuario Disponibles

Después de login con Google, tendrás acceso a:
- `userId` - UID único de Firebase
- `email` - Email del usuario
- `displayName` - Nombre completo
- `photoURL` - URL de la foto de perfil

Accede mediante:
```typescript
this.authService.currentUser() // Signal con los datos
```

---

**¿Preguntas o problemas? Revisa los pasos anteriores o consulta la documentación de Firebase.**
