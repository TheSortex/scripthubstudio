export {};

declare global {
  interface TestGlobalCheck {
    test: string;
  }
  
  interface Window {
    versions: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
    };

    eventBus?: {
      emit: (eventName: string, data: any) => void;
      on: (eventName: string, callback: (data: any) => void) => void;
    };

    electron?: {
      process?: {
        versions: {
          electron: string;
          chrome: string;
          node: string;
        };
      };
      ipcRenderer: {
        send(channel: string, ...args: any[]): void;
      };
    };

    electronAPI: {
      getUserPreferences: () => Promise<any>;
      setUserPreferences: (preferences: { theme: string }) => Promise<void>;
    };
    
    store: {
      get: <K extends keyof any>(key: K, defaultValue?: any) => Promise<any>;
      set: <K extends keyof any>(key: K, value: any) => void;
      delete: <K extends keyof any>(key: K) => void;
      openInEditor: () => Promise<void>;
    };
  }
}
  