//Maneja el CRUD de las flores y sus coordenadas dentro de un jardin especifico 
import { DatabaseService } from "../db/database";

export interface Flor {
    id: number;
    jardin_id: number;
    dibujo_base64: string;
    pos_x: number;
    pos_y: number;
    plantada: number; // 0 = en bandeja, 1 = platada en el jardin
}

export class FlorModel {
    //Obtener todas las flores pertenecientes a un jardin
    static getByJardin(jardinId: number): Flor[] {
        const db = DatabaseService.getDb();
        const stmt = db.prepare(`SELECT id, jardin_id, dibujo_base64, pos_x, pos_y, plantada FROM flores WHERE jardin_id = ? ORDER BY id ASC`);
        stmt.bind([jardinId]);

        const flores: Flor[] = [];
        while (stmt.step()){
            flores.push(stmt.getAsObject() as unknown as Flor);
        }
        stmt.free();
        return flores;
    }

    //Guarda una nueva flor recien dibujada en la bandeja del jardin
    static create(jardinId: number, dibujoBase64: string): void{
        const db = DatabaseService.getDb();
        db.run(
            'INSERT INTO flores (jardin_id, dibujo_base64, pos_x, pos_y, plantada) VALUES (?, ?, 50, 50, 0)',
            [jardinId, dibujoBase64]
        );
        DatabaseService.save();
    }

    //Planta la flor en unas coordenadas especificas (%) del paisaje
    static plantar(id: number, posX: number, posY: number): void {
        const db = DatabaseService.getDb();
        db.run(
            'UPDATE flores SET pos_x = ?, pos_y = ?, plantada = 1 WHERE id = ?',
            [posX, posY, id]
        );
        DatabaseService.save();
    }

    //Devuelve la flor a la bandeja
    static desplantar(id: number): void {
        const db = DatabaseService.getDb();
        db.run(
            'UPDATE flores SET pos_x = 50, pos_y = 50, plantada = 0 WHERE id = ?',
            [id]
        );
        DatabaseService.save();
    }

    //Elimina una flor
    static delete(id: number): void{
        const db = DatabaseService.getDb();
        db.run('DELETE FROM flores WHERE id = ?', [id]);
        DatabaseService.save();
    }
}