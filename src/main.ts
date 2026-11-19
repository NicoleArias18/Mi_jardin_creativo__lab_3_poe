import './styles/style.css';
import { DatabaseService } from './db/database';
import { JardinController } from './controllers/jardinController';

class App {
  private static appContainer: HTMLElement;

  static async init() {
    this.appContainer = document.querySelector('#app') as HTMLElement;
    if (!this.appContainer) return;

    // Pantalla de carga mientras se inicializa WebAssembly y localStorage
    this.appContainer.innerHTML = `
      <div class="loading-screen" style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
        <h2>Inicializando Jardín de Recuerdos...</h2>
      </div>
    `;

    try {
      await DatabaseService.init();
      JardinController.init(this.appContainer);
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
      this.appContainer.innerHTML = `
        <div class="error-screen" style="padding: 2rem; text-align: center; color: #d63031;">
          <h2>Error al cargar la base de datos</h2>
          <p>Por favor, verifica la consola o recarga la página.</p>
        </div>
      `;
    }
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}