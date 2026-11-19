//Muestra el lienzo del jardin, la bandeja de las flores creadas y las indicaciones iniciales 
import { type Jardin } from "../models/jardinModel";
import { type Flor } from "../models/florModel";
import { montarTutorial, tutorialYaVisto } from "./tutorial";

export interface JardinViewHandlers {
    onVolver: () => void;
    onDibujar: () => void;
    onEliminarFlor: (id: number) => void;
    onPlantar: (id: number, x: number, y: number) => void;
    onDesplantar: (id: number) => void;
}

export class JardinView{
    static render(
        container: HTMLElement,
        jardin: Jardin,
        flores: Flor[],
        handlers: JardinViewHandlers,
        florGerminandoId: number | null = null,
        abrirTutorial = false
    ): void {
        const floresBandeja = flores.filter(f => f.plantada === 0);
        const floresPlantadas = flores.filter(f => f.plantada === 1);

        container.innerHTML = `
        <div class="jardin-container">
        <header class="jardin-header">
          <button id="btn-back" class="btn-secondary">Volver al inicio</button>
          <div class="jardin-title-info">
            <h2>${escapeHTML(jardin.nombre)}</h2>
            <span>Creador: ${escapeHTML(jardin.autor)}</span>
          </div>
          <div class="jardin-header-actions">
            <button id="btn-ayuda" class="btn-secondary" type="button" title="Cómo usar el jardín">Ayuda</button>
            <button id="btn-nueva-flor" class="btn-primary">Dibujar Nueva Flor</button>
          </div>
        </header>

        <div class="jardin-main-layout">
          <!-- El Paisaje / Lienzo donde se plantan las flores -->
          <div id="paisaje-canvas" class="paisaje-canvas">
            <div class="paisaje-scene pixel-scene" aria-hidden="true">
              <div class="px-sun"></div>
              <div class="px-cloud c1"></div>
              <div class="px-cloud c2"></div>
              <div class="px-cloud c3"></div>
              <div class="px-bird b1"></div>
              <div class="px-bird b2"></div>
              <div class="px-hill h-back"></div>
              <div class="px-hill h-mid"></div>
              <div class="px-tree t-left"></div>
              <div class="px-tree t-right"></div>
              <div class="px-hill h-front"></div>
              <div class="px-path"></div>
              <div class="px-grass"></div>
            </div>
            ${
              floresPlantadas.map(f => `
                <div class="flor-en-paisaje${f.id === florGerminandoId ? ' germinando' : ''}" style="left: ${f.pos_x}%; top: ${f.pos_y}%;" data-id="${f.id}" title="Haz clic para quitar">
                  <div class="flor-planta">
                    <img class="flor-cabeza" src="${f.dibujo_base64}" alt="Flor plantada" />
                    <div class="tallo-wrap">
                      <span class="tallo-hoja tallo-hoja-izq"></span>
                      <span class="tallo"></span>
                      <span class="tallo-hoja tallo-hoja-der"></span>
                    </div>
                  </div>
                </div>
              `).join('')
            }
            <div class="paisaje-hint">Selecciona una flor y planta en el pasto. Clic en una plantada para devolverla.</div>
          </div>

          <!-- Bandeja lateral de flores creadas sin plantar -->
          <aside class="bandeja-sidebar">
            <h3>Bandeja de Flores</h3>
            <p class="hint">Selecciona una flor y luego haz clic en el paisaje para sembrarla.</p>
            <div id="bandeja-grid" class="bandeja-grid">
              ${
                floresBandeja.length === 0
                  ? `<p class="empty-tray">No hay flores en la bandeja. ¡Dibuja una!</p>`
                  : floresBandeja.map(f => `
                      <div class="flor-item-bandeja" data-id="${f.id}">
                        <img src="${f.dibujo_base64}" alt="Flor en bandeja" />
                        <button class="btn-del-flor" data-id="${f.id}" title="Eliminar">X</button>
                      </div>
                    `).join('')
                }
            </div>
          </aside>
        </div>
      </div>
    `;

    //Botonos de navegacion
    container.querySelector('#btn-back')?.addEventListener('click', handlers.onVolver);
    container.querySelector('#btn-nueva-flor')?.addEventListener('click', handlers.onDibujar);
    container.querySelector('#btn-ayuda')?.addEventListener('click', () => montarTutorial(container));

    if (abrirTutorial && !tutorialYaVisto()) {
        montarTutorial(container);
    }

    //Logica para seleccionar flor de la bandeja y plantar en el paisaje
    let florSeleccionadaId: number | null = null;

    container.querySelectorAll('.flor-item-bandeja').forEach(item =>{
        item.addEventListener('click', (e) => {
            if  ((e.target as HTMLElement).classList.contains('btn-del-flor')) return;

            container.querySelectorAll('.flor-item-bandeja').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            florSeleccionadaId = Number(item.getAttribute('data-id'));
        });
    });

    //Borrar flor individual desde la bandeja
    container.querySelectorAll('.btn-del-flor').forEach(btn => {
        btn.addEventListener('click', () =>{
            const id = Number(btn.getAttribute('data-id'));
            handlers.onEliminarFlor(id);
        });
    });

    //Plantar flor al hacer clic en el paisaje
    const paisaje = container.querySelector('#paisaje-canvas') as HTMLElement;
    paisaje.addEventListener('click', (e) =>{
        if (florSeleccionadaId === null) return;

        const rect = paisaje.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        y = Math.min(90, Math.max(58, y));

        handlers.onPlantar(florSeleccionadaId, Number(x.toFixed(2)), Number(y.toFixed(2)));
    });

    // Devolver flor al hacer clic en una flor ya sembrada, cambia plantada === 0
    container.querySelectorAll('.flor-en-paisaje').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(el.getAttribute('data-id'));
            handlers.onDesplantar(id);
        });
    });

   }
}

function escapeHTML(str: string): string{
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'} [tag] || tag)
    );
}