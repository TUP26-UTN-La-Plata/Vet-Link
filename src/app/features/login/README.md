# Sistema de Autenticación - Vet-Link

## Descripción General

Este módulo de autenticación implementa un sistema de login con sesión basada en `sessionStorage`. La sesión persiste durante toda la vida de la pestaña del navegador, pero se elimina cuando se cierra la pestaña.

## Estructura de Carpetas

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          # Guard para proteger rutas
│   └── services/
│       └── auth.service.ts        # Servicio de autenticación
├── features/
│   └── login/
│       ├── login.ts               # Componente de login
│       ├── login.html             # Template del login
│       └── login.css              # Estilos del login
└── app.routes.ts                  # Rutas con guard aplicado
```

## Componentes Principales

### 1. **AuthService** (`core/services/auth.service.ts`)

Servicio centralizado que gestiona la autenticación y sesión.

**Métodos principales:**
- `login(userId)` - Crea una nueva sesión
- `logout()` - Elimina la sesión actual
- `isLoggedIn()` - Verifica si el usuario está autenticado
- `getSession()` - Obtiene los datos de la sesión actual

**Propiedades:**
- `isAuthenticated` - Signal que indica el estado de autenticación

### 2. **AuthGuard** (`core/guards/auth.guard.ts`)

Guard que protege las rutas y verifica la autenticación.

**Comportamiento:**
- Si el usuario tiene sesión activa, permite el acceso
- Si no tiene sesión, redirige a `/login`

### 3. **Login Component** (`features/login/`)

Componente de presentación del login.

**Funcionalidades:**
- Verifica si ya existe una sesión activa al iniciar
- Muestra un spinner de carga durante 2 segundos
- Simula la verificación de usuario
- Crea la sesión y redirige a `/patients`

**Interfaz:**
- Logo con icono de corazón
- Botón "Iniciar sesión"
- Spinner durante la carga
- Diseño responsivo

## Flujo de Autenticación

```
1. Usuario accede a la aplicación
   ↓
2. AuthGuard verifica si existe sesión
   ↓
3. ¿Tiene sesión válida?
   ├─ SÍ → Permite acceso a rutas protegidas
   └─ NO → Redirige a /login
   ↓
4. Usuario hace click en "Iniciar sesión"
   ↓
5. Spinner de 2 segundos (simulación)
   ↓
6. Sesión se guarda en sessionStorage
   ↓
7. Redirige a /patients (vista principal)
```

## Almacenamiento de Sesión

La sesión se guarda en `sessionStorage` con la siguiente estructura:

```json
{
  "userId": "user_1234567890",
  "loginTime": "2024-04-28T10:30:00.000Z",
  "isAuthenticated": true
}
```

**Duración:**
- Persiste mientras la pestaña del navegador esté abierta
- Se elimina automáticamente al cerrar la pestaña
- Si el usuario recarga la página, la sesión se mantiene

## Cómo Usar

### En un Componente

```typescript
import { AuthService } from './core/services/auth.service';

export class MyComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
    // El AuthGuard redirigirá a login automáticamente
  }

  checkAuth() {
    if (this.authService.isLoggedIn()) {
      const session = this.authService.getSession();
      console.log('Usuario:', session?.userId);
    }
  }
}
```

### En las Rutas

```typescript
// El guard ya está aplicado a todas las rutas protegidas
// en app.routes.ts
```

## Estilos

Los estilos se encuentran en `login.css` e incluyen:

- **Gradiente de fondo** usando colores primarios de la marca
- **Animaciones suaves** para la tarjeta y el logo
- **Spinner personalizado** con animación de rotación
- **Diseño responsivo** para dispositivos móviles
- **Efectos hover** en el botón

## Personalización

### Cambiar el tiempo de carga

En `login.ts`, modifica el `setTimeout`:

```typescript
setTimeout(() => {
  this.authService.login();
  this.isLoading.set(false);
  this.router.navigate(['/patients']);
}, 3000); // Cambiar de 2000ms a 3000ms
```

### Agregar validación real

Reemplaza la simulación con una llamada HTTP real:

```typescript
handleLogin(): void {
  this.isLoading.set(true);

  this.http.post('/api/login', {}).subscribe({
    next: (response: any) => {
      this.authService.login(response.userId);
      this.router.navigate(['/patients']);
    },
    error: () => {
      this.isLoading.set(false);
      // Mostrar error
    }
  });
}
```

## Seguridad

⚠️ **Notas Importantes:**

1. `sessionStorage` NO es seguro contra ataques XSS. Considere implementar:
   - CSRF tokens
   - Validación en el servidor
   - HTTPOnly cookies para tokens reales

2. Para producción, implemente autenticación real con:
   - Backend API
   - JWT tokens
   - Validación en servidor

3. El sistema actual es para demostración. En producción, proteja siempre el backend.
