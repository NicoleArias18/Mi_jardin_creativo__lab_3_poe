//Archivo donde controla la seccion de la pizarra
//  del dibujo que hara el usario
const COLORES = ['#c45c28', '#e07a3d', '#f0a35a', '#d4a017', '#8b3d18', '#7a2e4a', '#6b5a28', '#2d3436'];

export interface PizarraViewHandlers {
  onVolver: () => void;
  onGuardar: (dibujoBase64: string) => void;
}

export class PizarraView {
  static render(
    container: HTMLElement,
    _jardinId: number,
    handlers: PizarraViewHandlers
  ): void {
    container.innerHTML = `
      <div class="pizarra-container">
        <header class="pizarra-header">
          <button id="btn-volver" class="btn-secondary">Volver al Jardín</button>
          <h2>Lienzo Creativo: Dibuja tu Flor</h2>
          <button id="btn-guardar-flor" class="btn-primary">Guardar Flor en la Bandeja</button>
        </header>

        <div class="pizarra-main">
          <div class="tools-sidebar">
            <h3>Herramientas</h3>
            <p class="hint">Dibuja la cabeza en pixel-art. El tallo aparecerá al plantarla.</p>
            
            <div class="tool-group">
              <span>Color del Pincel:</span>
              <div class="color-swatches" role="list">
                ${COLORES.map((color, i) => `
                  <button type="button" class="swatch${i === 0 ? ' active' : ''}" data-color="${color}" style="background:${color}" aria-label="Color ${color}"></button>
                `).join('')}
                <label class="swatch swatch-custom" title="Más colores">
                  <input type="color" id="color-picker" value="#c45c28" />
                </label>
              </div>
            </div>

            <div class="tool-group">
              <label for="brush-size">Píxeles (<span id="size-val">2</span>):</label>
              <input type="range" id="brush-size" min="1" max="6" value="2" />
            </div>

            <div class="tool-actions">
              <button id="btn-pencil" class="btn-tool active">Pincel</button>
              <button id="btn-fill" class="btn-tool" title="Relleno">
                <svg class="icon-bucket" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 3.5c0-1 1-1.5 2-1.5s2 .5 2 1.5V5H8V3.5z" fill="#5c4030"/>
                  <path d="M4 8h16l-1.5 11H5.5L4 8z" fill="#c45c28"/>
                  <path d="M5.2 10h13.6l-.3 2.2H5.5L5.2 10z" fill="#e07a3d"/>
                  <path d="M16.5 12.5c1.8 0 3 1.3 3 2.8 0 1.8-3 4.2-3 4.2s-3-2.4-3-4.2c0-1.5 1.2-2.8 3-2.8z" fill="#f0a35a"/>
                  <path d="M3 7.2h18v1.6H3z" fill="#2a2118"/>
                </svg>
                Relleno
              </button>
              <button id="btn-eraser" class="btn-tool">Borrador</button>
              <button id="btn-clear" class="btn-tool danger">Limpiar Todo</button>
            </div>
          </div>

          <div class="canvas-wrapper canvas-transparent">
            <canvas id="drawing-canvas" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#drawing-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const CELL = 4;
    type Tool = 'pencil' | 'fill' | 'eraser';
    let isDrawing = false;
    let currentColor = '#c45c28';
    let currentSize = 2;
    let currentTool: Tool = 'pencil';
    let lastCellX: number | null = null;
    let lastCellY: number | null = null;

    const btnPencil = container.querySelector('#btn-pencil') as HTMLButtonElement;
    const btnFill = container.querySelector('#btn-fill') as HTMLButtonElement;
    const btnEraser = container.querySelector('#btn-eraser') as HTMLButtonElement;

    const setTool = (tool: Tool) => {
      currentTool = tool;
      btnPencil.classList.toggle('active', tool === 'pencil');
      btnFill.classList.toggle('active', tool === 'fill');
      btnEraser.classList.toggle('active', tool === 'eraser');
      canvas.classList.toggle('cursor-fill', tool === 'fill');
    };

    const colorAtCell = (data: Uint8ClampedArray, cx: number, cy: number) => {
      const px = cx * CELL;
      const py = cy * CELL;
      const i = (py * canvas.width + px) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]] as const;
    };

    const sameColor = (a: readonly number[], b: readonly number[]) =>
      a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

    const hexToRgba = (hex: string) => {
      const n = hex.replace('#', '');
      return [
        parseInt(n.slice(0, 2), 16),
        parseInt(n.slice(2, 4), 16),
        parseInt(n.slice(4, 6), 16),
        255,
      ] as const;
    };

    const floodFill = (startX: number, startY: number) => {
      const cols = Math.floor(canvas.width / CELL);
      const rows = Math.floor(canvas.height / CELL);
      if (startX < 0 || startY < 0 || startX >= cols || startY >= rows) return;

      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = img.data;
      const target = colorAtCell(data, startX, startY);
      const fill = hexToRgba(currentColor);
      if (sameColor(target, fill)) return;

      const stack: Array<[number, number]> = [[startX, startY]];
      const seen = new Uint8Array(cols * rows);

      while (stack.length > 0) {
        const [x, y] = stack.pop() as [number, number];
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        const idx = y * cols + x;
        if (seen[idx]) continue;
        if (!sameColor(colorAtCell(data, x, y), target)) continue;
        seen[idx] = 1;

        for (let dy = 0; dy < CELL; dy++) {
          for (let dx = 0; dx < CELL; dx++) {
            const i = ((y * CELL + dy) * canvas.width + (x * CELL + dx)) * 4;
            data[i] = fill[0];
            data[i + 1] = fill[1];
            data[i + 2] = fill[2];
            data[i + 3] = fill[3];
          }
        }

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }

      ctx.putImageData(img, 0, 0);
    };

    const pointerToCell = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      return {
        cx: Math.floor(x / CELL),
        cy: Math.floor(y / CELL),
      };
    };

    const paintCell = (cx: number, cy: number) => {
      const px = cx * CELL;
      const py = cy * CELL;
      const dim = currentSize * CELL;
      if (currentTool === 'eraser') {
        ctx.clearRect(px, py, dim, dim);
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = currentColor;
        ctx.fillRect(px, py, dim, dim);
      }
    };

    const paintLine = (x0: number, y0: number, x1: number, y1: number) => {
      let dx = Math.abs(x1 - x0);
      const sx = x0 < x1 ? 1 : -1;
      let dy = -Math.abs(y1 - y0);
      const sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      while (true) {
        paintCell(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x0 += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y0 += sy;
        }
      }
    };

    const startPosition = (e: MouseEvent | TouchEvent) => {
      const { cx, cy } = pointerToCell(e);
      if (currentTool === 'fill') {
        floodFill(cx, cy);
        return;
      }
      isDrawing = true;
      lastCellX = cx;
      lastCellY = cy;
      paintCell(cx, cy);
    };

    const finishedPosition = () => {
      isDrawing = false;
      lastCellX = null;
      lastCellY = null;
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing || lastCellX === null || lastCellY === null) return;
      const { cx, cy } = pointerToCell(e);
      paintLine(lastCellX, lastCellY, cx, cy);
      lastCellX = cx;
      lastCellY = cy;
    };

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mouseleave', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startPosition(e);
    }, { passive: false });
    canvas.addEventListener('touchend', finishedPosition);
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      draw(e);
    }, { passive: false });

    const setColor = (color: string) => {
      currentColor = color;
      const picker = container.querySelector('#color-picker') as HTMLInputElement | null;
      if (picker && /^#[0-9a-fA-F]{6}$/.test(color)) {
        picker.value = color;
      }
      container.querySelectorAll('.swatch').forEach((el) => {
        el.classList.toggle('active', el.getAttribute('data-color') === color);
      });
    };

    container.querySelectorAll('.swatch[data-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (color) setColor(color);
      });
    });

    const colorPicker = container.querySelector('#color-picker') as HTMLInputElement;
    colorPicker.addEventListener('input', (e) => {
      setColor((e.target as HTMLInputElement).value);
    });

    const brushSize = container.querySelector('#brush-size') as HTMLInputElement;
    const sizeVal = container.querySelector('#size-val') as HTMLElement;
    brushSize.addEventListener('input', (e) => {
      currentSize = Number((e.target as HTMLInputElement).value);
      sizeVal.textContent = String(currentSize);
    });

    btnPencil.addEventListener('click', () => setTool('pencil'));
    btnFill.addEventListener('click', () => setTool('fill'));
    btnEraser.addEventListener('click', () => setTool('eraser'));

    const btnClear = container.querySelector('#btn-clear') as HTMLButtonElement;
    btnClear.addEventListener('click', () => {
      if (confirm('¿Deseas limpiar todo el lienzo?')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    container.querySelector('#btn-volver')?.addEventListener('click', handlers.onVolver);

    const btnGuardar = container.querySelector('#btn-guardar-flor') as HTMLButtonElement;
    btnGuardar.addEventListener('click', () => {
      const base64Image = recortarCabezaFlor(canvas);
      if (!base64Image) return;
      handlers.onGuardar(base64Image);
    });
  }
}

/** Recorta el dibujo a un PNG transparente, solo la cabeza pintada. */
function recortarCabezaFlor(source: HTMLCanvasElement): string | null {
  const ctx = source.getContext('2d');
  if (!ctx) return null;

  const { width, height } = source;
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) return null;

  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.imageSmoothingEnabled = false;
  octx.drawImage(source, minX, minY, w, h, 0, 0, w, h);
  return out.toDataURL('image/png');
}
