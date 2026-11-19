import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";

export class DatabaseService {
    private static db: SqlJsDatabase | null = null;
    private static readonly STORAGE_KEY = 'sqlite_db_jardin';

    //Inializamos SQL.JS y creamos la base de datos
    static async init(): Promise<SqlJsDatabase>{
        if (this.db) return this.db;

        const SQL = await initSqlJs();

        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if(savedData) {
            const binary = Uint8Array.from(atob(savedData), c => c.charCodeAt(0));
            this.db = new SQL.Database(binary);
        }else{
            this.db = new SQL.Database();
        }

        this.db.run('PRAGMA foreign_keys = ON;');

        //Crear las tablas por si no existen
        this.db.run(`
            CREATE TABLE IF NOT EXISTS jardines (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nombre TEXT NOT NULL,
              autor TEXT NOT NULL,
              fecha_creacion TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS flores (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              jardin_id INTEGER NOT NULL,
              dibujo_base64 TEXT NOT NULL,
              pos_x REAL DEFAULT 50,
              pos_y REAL DEFAULT 50,
              plantada INTEGER DEFAULT 0,
              FOREIGN KEY (jardin_id) REFERENCES jardines(id) ON DELETE CASCADE
            );
        `);

        this.save();
        return this.db;
    }

    //Guarda la BD en localStorage (persistencia)
    static save(): void {
        if(!this.db) return;
        const data = this.db.export();
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < data.length; i += chunkSize) {
            binary += String.fromCharCode(...data.subarray(i, i + chunkSize));
        }
        localStorage.setItem(this.STORAGE_KEY, btoa(binary));
    }

    //Obtiene la instancia de la BD
    static getDb(): SqlJsDatabase {
        if(!this.db) throw new Error('Base de datos no inicializada');
        return this.db;
    }
}