// Conecta los clics de las vistas con los modelos, valida formularios y actualiza la interfaz
import { JardinModel, type Jardin } from '../models/jardinModel';
import { FlorModel, type Flor } from '../models/florModel';
import { HomeView } from '../views/homeView';
import { JardinView } from '../views/jardinView';
import { PizarraView } from '../views/pizarraView';

export class JardinController {
  private static container: HTMLElement;

  static init(container: HTMLElement): void {
    this.container = container;
    this.irAInicio();
  }

  static listarJardines(): Jardin[] {
    return JardinModel.getAll();
  }

  static obtenerJardin(id: number): Jardin | undefined {
    return JardinModel.getAll().find((jardin) => jardin.id === id);
  }

  static listarFlores(jardinId: number): Flor[] {
    return FlorModel.getByJardin(jardinId);
  }

  static irAInicio(): void {
    HomeView.render(this.container, this.listarJardines(), {
      onCrear: (nombre, autor) => this.crearJardin(nombre, autor),
      onEntrar: (id) => this.irAJardin(id, true),
      onEliminar: (id) => this.eliminarJardin(id),
    });
  }

  static crearJardin(nombre: string, autor: string): void {
    const nombreLimpio = nombre.trim();
    const autorLimpio = autor.trim();
    if (!nombreLimpio || !autorLimpio) return;

    const id = JardinModel.create(nombreLimpio, autorLimpio);
    this.irAJardin(id, true);
  }

  static eliminarJardin(id: number): void {
    JardinModel.delete(id);
    this.irAInicio();
  }

  static irAJardin(
    jardinId: number,
    abrirTutorial = false,
    florGerminandoId: number | null = null
  ): void {
    const jardin = this.obtenerJardin(jardinId);
    if (!jardin) {
      this.irAInicio();
      return;
    }

    JardinView.render(
      this.container,
      jardin,
      this.listarFlores(jardinId),
      {
        onVolver: () => this.irAInicio(),
        onDibujar: () => this.irAPizarra(jardinId),
        onEliminarFlor: (id) => this.eliminarFlor(jardinId, id),
        onPlantar: (id, x, y) => this.plantarFlor(jardinId, id, x, y),
        onDesplantar: (id) => this.desplantarFlor(jardinId, id),
      },
      florGerminandoId,
      abrirTutorial
    );
  }

  static irAPizarra(jardinId: number): void {
    PizarraView.render(this.container, jardinId, {
      onVolver: () => this.irAJardin(jardinId),
      onGuardar: (dibujoBase64) => this.guardarFlor(jardinId, dibujoBase64),
    });
  }

  static guardarFlor(jardinId: number, dibujoBase64: string): void {
    if (!dibujoBase64) return;
    FlorModel.create(jardinId, dibujoBase64);
    this.irAJardin(jardinId);
  }

  static plantarFlor(jardinId: number, florId: number, posX: number, posY: number): void {
    FlorModel.plantar(florId, posX, posY);
    this.irAJardin(jardinId, false, florId);
  }

  static desplantarFlor(jardinId: number, florId: number): void {
    FlorModel.desplantar(florId);
    this.irAJardin(jardinId);
  }

  static eliminarFlor(jardinId: number, florId: number): void {
    FlorModel.delete(florId);
    this.irAJardin(jardinId);
  }
}
