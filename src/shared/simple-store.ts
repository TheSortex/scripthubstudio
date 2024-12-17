// src/shared/SimpleStore.ts
import { app, ipcMain, shell, IpcMainInvokeEvent } from 'electron';
import { existsSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';

type ConfigData = Record<string, any>;

interface SimpleStoreOptions<T> {
    name?: string;
    cwd?: string;
    defaults?: Partial<T>;
}

class SimpleStore<T extends ConfigData> {
    private name: string;
    private cwd: string;
    private filePath: string;
    private data: T;

    constructor(options: SimpleStoreOptions<T> = {}) {
        this.name = options.name || 'config';
        this.cwd = options.cwd || app.getPath('userData');
        this.filePath = join(this.cwd, `${this.name}.json`);
        this.data = this._load(options.defaults);

        // Initialisiere IPC-Handler nur im Main-Prozess
        if (process.type === 'browser') {
            this._initIpc();
        }
    }

    private _initIpc(): void {
        ipcMain.handle('simple-store-get', (_event: IpcMainInvokeEvent, key: keyof T, defaultValue?: any) => {
            return this.get(key as string, defaultValue);
        });

        ipcMain.handle('simple-store-set', (_event: IpcMainInvokeEvent, key: keyof T, value: any) => {
            this.set(key as string, value);
        });

        ipcMain.handle('simple-store-delete', (_event: IpcMainInvokeEvent, key: keyof T) => {
            this.delete(key as string);
        });

        ipcMain.handle('simple-store-open', async () => {
            try {
                await shell.openPath(this.filePath);
            } catch (error) {
                throw new Error(`Failed to open file: ${(error as Error).message}`);
            }
        });
    }

    private _load(defaults?: Partial<T>): T {
        let data: T = {} as T;

        try {
            if (!existsSync(this.filePath)) {
                if (defaults) {
                    data = { ...defaults } as T;
                    this._save();
                } else {
                    writeFileSync(this.filePath, '{}', 'utf-8');
                }
                return data;
            }

            const raw = readFileSync(this.filePath, 'utf-8');
            data = JSON.parse(raw) as T;

            // Merge defaults
            if (defaults) {
                data = { ...defaults, ...data };
                this._save();
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }

        return data;
    }

    private _save(): void {
        try {
            const tempPath = `${this.filePath}.tmp`;
            writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
            renameSync(tempPath, this.filePath);
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    public get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] {
        const keys = key.toString().split('.') as (keyof any)[];
        let value: any = this.data;

        for (const part of keys) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                value = undefined;
                break;
            }
        }

        return value !== undefined ? value : defaultValue;
    }

    public set<K extends keyof T>(key: K, value: T[K]): void {
        const keys = key.toString().split('.') as (keyof any)[];
        let obj: any = this.data;

        keys.slice(0, -1).forEach(part => {
            if (!obj[part] || typeof obj[part] !== 'object') {
                obj[part] = {};
            }
            obj = obj[part];
        });

        obj[keys[keys.length - 1]] = value;
        this._save();
    }

    public delete<K extends keyof T>(key: K): void {
        const keys = key.toString().split('.') as (keyof any)[];
        let obj: any = this.data;

        keys.slice(0, -1).forEach(part => {
            if (!obj[part] || typeof obj[part] !== 'object') {
                return;
            }
            obj = obj[part];
        });

        delete obj[keys[keys.length - 1]];
        this._save();
    }

    public async openInEditor(): Promise<void> {
        try {
            await shell.openPath(this.filePath);
        } catch (error) {
            throw new Error(`Failed to open file: ${(error as Error).message}`);
        }
    }

    // Statische Methode zur Initialisierung im Renderer-Prozess
    public static initRenderer(): void {
        // Keine spezifische Initialisierung notwendig, da IPC-Handler bereits im Main-Prozess sind
    }
}

export default SimpleStore;
