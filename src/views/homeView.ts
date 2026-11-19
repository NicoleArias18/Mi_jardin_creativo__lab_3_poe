// Muestra el home inicial al solo acceder a la pagina
import { type Jardin } from '../models/jardinModel';

export interface HomeViewHandlers {
  onCrear: (nombre: string, autor: string) => void;
  onEntrar: (id: number) => void;
  onEliminar: (id: number) => void;
}

export class HomeView {
  static render(
    container: HTMLElement,
    jardines: Jardin[],
    handlers: HomeViewHandlers
  ): void {
    container.innerHTML = `
          <div class="home-container">
           <div class="autumn-sky" aria-hidden="true">
             ${Array.from({ length: 16 }, (_, i) => `<span class="px-leaf leaf-${i + 1}"></span>`).join('')}
           </div>
           <header class="home-header">
            <h1>Jardin de Recuerdos</h1>
             <p>Un espacio digital para crear y cultivar tus propias flores.</p>
             <div class="home-hero-art" aria-hidden="true">
               <div class="hero-sun"></div>
               <div class="hero-cloud hero-cloud-a"></div>
               <div class="hero-cloud hero-cloud-b"></div>
               <div class="hero-hill"></div>
               <div class="hero-tree hero-tree-l"></div>
               <div class="hero-tree hero-tree-r"></div>
               <div class="hero-ground"></div>
             </div>
           </header>

        <section class="form-section">
          <form id="form-jardin" class="card-form">
            <h3>Crear un nuevo Jardín</h3>
            <div class="input-group">
              <input type="text" id="nombre-jardin" placeholder="Nombre del jardín (ej. Recuerdos de Verano)" required autocomplete="off" />
              <input type="text" id="autor-jardin" placeholder="nombre del autor" required autocomplete="off" />
              <button type="submit" class="btn-primary">Crear Jardín</button>
            </div>
          </form>
        </section>

        <section class="list-section">
          <h2>Jardines Existentes</h2>
          <div id="jardines-grid" class="grid-jardines">
            ${
              jardines.length === 0
                ? `<p class="empty-msg">Aún no hay jardines creados. ¡Crea el primero arriba!</p>`
                : jardines.map(j => `
                    <div class="jardin-card" data-id="${j.id}">
                      <div class="card-info">
                        <h3>${escapeHTML(j.nombre)}</h3>
                        <p>Creado por: <strong>${escapeHTML(j.autor)}</strong></p>
                        <span class="fecha">${j.fecha_creacion}</span>
                      </div>
                      <div class="card-actions">
                        <button class="btn-enter" data-id="${j.id}">Entrar al Jardín</button>
                        <button class="btn-delete" data-id="${j.id}">Eliminar</button>
                      </div>
                    </div>
                  `).join('')
            }
          </div>
        </section>
      </div>
    `;

    const form = container.querySelector('#form-jardin') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombreInput = container.querySelector('#nombre-jardin') as HTMLInputElement;
      const autorInput = container.querySelector('#autor-jardin') as HTMLInputElement;
      handlers.onCrear(nombreInput.value, autorInput.value);
    });

    container.querySelectorAll('.btn-enter').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        handlers.onEntrar(id);
      });
    });

    container.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        if (confirm('¿Estas seguro que quieres eliminar este jardin y todas sus flores?')) {
          handlers.onEliminar(id);
        }
      });
    });
  }
}

function escapeHTML(str: string): string {
  return str.replace(
    /[&<>'"]/g,
    (tag) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
