//Archivo que maneja el CRUD de los jardines 
import { DatabaseService } from "../db/database";

export interface Jardin {
    id: number;
    nombre: string;
    autor: string;
    fecha_creacion: string;
}

export class JardinModel{
    //Obtener todos los jardines ordenados del mas reciente al mas antiguo
    static getAll(): Jardin[]{
        const db = DatabaseService.getDb();
        const stmt = db.prepare('SELECT id, nombre, autor, fecha_creacion FROM jardines ORDER BY id DESC');
        const jardines: Jardin[] = [];

        while(stmt.step()){
            jardines.push(stmt.getAsObject() as unknown as Jardin);
        }
        stmt.free();
        return jardines;
    }

    //Crea un nuevo jardin y devuelve su ID
    static create(nombre: string, autor: string): number{
        const db = DatabaseService.getDb();
        const fecha = new Date().toLocaleDateString('es-SV');

        db.run(
            'INSERT INTO jardines (nombre, autor, fecha_creacion) VALUES (?,?,?)',
            [nombre.trim(), autor.trim(), fecha]
        );

        const res = db.exec('SELECT last_insert_rowid()');
        const id = Number(res[0].values[0][0]);

        DatabaseService.save();
        return id;
    }

    //Elimina un jardin (sus flores se borran en cascada)
    static delete(id: number): void {
        const db = DatabaseService.getDb();
        db.run('DELETE FROM jardines WHERE id = ?', [id]);
        DatabaseService.save();
    }
}