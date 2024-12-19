import { app, shell } from 'electron';
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
  private defaults: Partial<T>;

  constructor(options: SimpleStoreOptions<T> = {}) {
    this.name = options.name || 'config';
    this.cwd = options.cwd || app.getPath('userData');
    this.filePath = join(this.cwd, `${this.name}.json`);
    this.defaults = options.defaults || {};
    this.data = this._load();
  }

  private _load(): T {
    let data: T = {} as T;

    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8');
        data = raw.trim() ? JSON.parse(raw) as T : {} as T;
      }

      // Defaults mit geladenen Daten mergen
      data = { ...this.defaults, ...data };
    } catch (error) {
      console.error('Failed to load config:', error);
      data = { ...this.defaults } as T; // Fallback auf Defaults
    }

    this.data = data; // Sicherstellen, dass `this.data` initialisiert ist
    this._save(); // Speichere gemischte Werte zurück
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

  public get<K extends keyof T>(key: K): T[K] {
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

    // Fallback auf Default-Wert
    const defaultValue = keys.reduce((acc, part) => acc?.[part], this.defaults as any);
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
}

export default SimpleStore;