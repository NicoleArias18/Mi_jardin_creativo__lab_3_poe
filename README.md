# Jardín de Recuerdos

Sitio web para crear jardines digitales y dibujar flores en pixel art. Cada flor se guarda en una bandeja y se puede plantar en el paisaje. Al recargar la página, los jardines y las flores siguen ahí.


## Qué se puede hacer

- Crear un jardín con nombre y autor.
- Ver la lista de jardines y entrar a cualquiera.
- Eliminar un jardín (pide confirmación).
- Dibujar la cabeza de una flor con pincel, relleno, borrador y colores.
- Guardar la flor en la bandeja del jardín.
- Plantarla en el pasto (crece un tallo) o devolverla a la bandeja.
- Borrar una flor de la bandeja.

Los datos se guardan con **SQLite en el navegador**. No se pierde la información al recargar, mientras se use el mismo navegador.

---

## Tecnologías

- **Vite** y **TypeScript** para armar y correr el sitio.
- **SQLite (sql.js)** para la base de datos dentro del navegador.
- **HTML y CSS** para las pantallas (inicio, jardín y pizarra).
- Organización **MVC**: vistas (lo que se ve), modelos (los datos) y controlador (une los clics con la base de datos).

Hay dos tablas: `jardines` y `flores`.

---

## Cómo ejecutarlo en la computadora

Este proyecto se ve en el navegador, pero primero hay que bajar el código y arrancarlo en la PC.

### 1. Tecnologias requeridas

- **Node.js:** 
- **Git:** si aún no lo tienes.
- **Visual Studio Code:** 

### 2. Clonar el repositorio de GitHub
Crea una nueva carpeta donde quieras guardar el repo del proyecto(ponle un nombre descriptivo)

Entra a **Visual Studio Code:** y selecciona **Clonar un repositorio en una carpeta local**, despues pega del url del repositorio de github y busca la carpeta que creaste para almacenar el clon del repositorio

### 3. Instalar dependencias y arrancar el sitio

En VS Code abre la terminal con **Terminal → Nueva terminal** (debe verse la carpeta del proyecto). Luego, **uno por uno**:

```bash
npm install
```

Espera a que termine (baja las librerías que el proyecto necesita). Después:

```bash
npm run dev
```

En la terminal va a aparecer una dirección, casi siempre:

```
http://localhost:5173
```

Mantén esa terminal abierta. En el navegador (Chrome, Edge, etc.) pega esa URL y presiona Enter. Ahí se abre **Jardín de Recuerdos**.

Para detenerlo, vuelve a la terminal y presiona `Ctrl + C`.

### Si algo no abre

- Revisa que estés **dentro de la carpeta del proyecto** antes de correr los comandos.
- Si `npm` no se reconoce, cierra VS Code, reinstala Node.js y vuelve a abrir el programa.
- Si el puerto 5173 está ocupado, Vite mostrará otra URL (por ejemplo `5174`); usa esa.

## Carpetas principales

- `src/views` — pantallas (inicio, jardín y pizarra de dibujo).
- `src/models` — crear, leer, actualizar y eliminar jardines y flores.
- `src/controllers` — recibe las acciones del usuario y actualiza la pantalla.
- `src/db` — inicia SQLite y guarda los datos para que persistan.
- `src/styles` — estilos y animaciones del jardín.

---

## Laboratorio 3 — POE

Proyecto creativo con SQLite, repositorio en GitHub y despliegue en Vercel.
