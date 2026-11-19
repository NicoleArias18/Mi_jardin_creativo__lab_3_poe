const STORAGE_KEY = 'gom_tutorial_visto';

export interface TutorialStep {
  title: string;
  text: string;
}

export const TUTORIAL_JARDIN: TutorialStep[] = [
  {
    title: 'Tu jardín',
    text: 'Este paisaje es tu lienzo. Aquí van a nacer las flores que dibujes. Puedes volver a ver esta guía con el botón de ayuda.',
  },
  {
    title: 'Crear una flor',
    text: 'Toca "Dibujar Nueva Flor". En el lienzo dibuja solo la cabeza: elige color, grosor, usa el borrador o limpia todo, y guarda para mandarla a la bandeja.',
  },
  {
    title: 'Elegir de la bandeja',
    text: 'Las flores guardadas aparecen a un lado. Haz clic en una para seleccionarla. La X la elimina para siempre.',
  },
  {
    title: 'Plantarla',
    text: 'Con una flor seleccionada, haz clic en el pasto del paisaje. Crecerá un tallo y tu dibujo aparecerá arriba.',
  },
  {
    title: 'Regresarla a la bandeja',
    text: 'Haz clic en una flor ya plantada si quieres sacarla del jardín. Volverá a la bandeja para sembrarla en otro lugar.',
  },
];

export function tutorialYaVisto(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export function marcarTutorialVisto(): void {
  localStorage.setItem(STORAGE_KEY, '1');
}

export function montarTutorial(root: HTMLElement, pasos: TutorialStep[] = TUTORIAL_JARDIN): void {
  root.querySelector('.tutorial-overlay')?.remove();

  let indice = 0;

  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
    <div class="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <p class="tutorial-progress"></p>
      <h3 id="tutorial-title"></h3>
      <p class="tutorial-text"></p>
      <div class="tutorial-actions">
        <button type="button" class="btn-secondary" data-tutorial="skip">Saltar</button>
        <div class="tutorial-nav">
          <button type="button" class="btn-secondary" data-tutorial="prev">Atrás</button>
          <button type="button" class="btn-primary" data-tutorial="next">Siguiente</button>
        </div>
      </div>
    </div>
  `;
  root.appendChild(overlay);

  const progress = overlay.querySelector('.tutorial-progress') as HTMLElement;
  const title = overlay.querySelector('#tutorial-title') as HTMLElement;
  const text = overlay.querySelector('.tutorial-text') as HTMLElement;
  const btnPrev = overlay.querySelector('[data-tutorial="prev"]') as HTMLButtonElement;
  const btnNext = overlay.querySelector('[data-tutorial="next"]') as HTMLButtonElement;

  const cerrar = () => {
    marcarTutorialVisto();
    overlay.remove();
  };

  const pintar = () => {
    const paso = pasos[indice];
    progress.textContent = `${indice + 1} / ${pasos.length}`;
    title.textContent = paso.title;
    text.textContent = paso.text;
    btnPrev.disabled = indice === 0;
    btnNext.textContent = indice === pasos.length - 1 ? 'Empezar' : 'Siguiente';
  };

  overlay.querySelector('[data-tutorial="skip"]')?.addEventListener('click', cerrar);
  btnPrev.addEventListener('click', () => {
    if (indice > 0) {
      indice -= 1;
      pintar();
    }
  });
  btnNext.addEventListener('click', () => {
    if (indice < pasos.length - 1) {
      indice += 1;
      pintar();
      return;
    }
    cerrar();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrar();
  });

  pintar();
}
