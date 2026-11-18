

### Descripcion de cada archivo 

## Base de Datos y Persistencia (`src/db/database.ts`)

Gestiona la conexión a **SQLite** en el navegador mediante **WebAssembly (`sql.js`)** y la persistencia automática de los datos usando la clase `DatabaseService`.

* **Inicialización (`init`):** Carga el motor `sql.js` en memoria y crea las tablas relacionales `jardines` y `flores` si aún no existen.
* **Persistencia (`localStorage`):** Restaura la base de datos previa al cargar la página y utiliza `save()` para exportar los cambios a Base64 en el navegador, evitando que la información se pierda al recargar.
* **Acceso Centralizado (`getDb`):** Mantiene una única instancia activa de la base de datos para que los modelos ejecuten consultas SQL de forma ordenada.

## Capa de Modelos (`src/models/`)

Encapsulan la lógica de negocio, las interfaces de TypeScript y las consultas SQL parametrizadas para interactuar con la base de datos a través de `DatabaseService`.

* **`jardinModel.ts` (`JardinModel`):**
  * `getAll()`: Consulta y lista todos los espacios registrados ordenados del más reciente al más antiguo.
  * `create(nombre, autor)`: Inserta un nuevo jardín con la fecha actual formateada (`es-SV`) y devuelve su ID único.
  * `delete(id)`: Elimina un jardín de forma relacional (las flores asociadas se borran automáticamente en cascada).

* **`florModel.ts` (`FlorModel`):**
  * `getByJardin(jardinId)`: Recupera todas las flores asociadas a un jardín específico.
  * `create(jardinId, dibujoBase64)`: Guarda un nuevo dibujo codificado en Base64 dentro de la bandeja del jardín en coordenadas iniciales por defecto.
  * `plantar(id, posX, posY)`: Actualiza la posición exacta (`pos_x`, `pos_y`) en porcentaje del lienzo y cambia el estado de la flor a "plantada" (`plantada = 1`).
  * `delete(id)`: Elimina una flor individual de la base de datos.