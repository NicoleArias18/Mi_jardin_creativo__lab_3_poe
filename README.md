

### Descripcion de cada archivo 

## 🗄️ Base de Datos y Persistencia (`src/db/database.ts`)

Gestiona la conexión a **SQLite** en el navegador mediante **WebAssembly (`sql.js`)** y la persistencia automática de los datos usando la clase `DatabaseService`.

* **Inicialización (`init`):** Carga el motor `sql.js` en memoria y crea las tablas relacionales `jardines` y `flores` si aún no existen.
* **Persistencia (`localStorage`):** Restaura la base de datos previa al cargar la página y utiliza `save()` para exportar los cambios a Base64 en el navegador, evitando que la información se pierda al recargar.
* **Acceso Centralizado (`getDb`):** Mantiene una única instancia activa de la base de datos para que los modelos ejecuten consultas SQL de forma ordenada.