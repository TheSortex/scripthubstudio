declare global {
    interface Window {
      lol: {
        cool: string;
      };
      electron: {
        process: {
          versions: {
            electron: string;
            chrome: string;
            node: string;
          };
        };
        ipcRenderer: {
          send: (channel: string, ...args: any[]) => void;
          invoke: (channel: string, ...args: any[]) => Promise<any>;
        };
      };
      store: {
        get: <K extends keyof any>(key: K, defaultValue?: any) => Promise<any>;
        set: <K extends keyof any>(key: K, value: any) => void;
        delete: <K extends keyof any>(key: K) => void;
        openInEditor: () => Promise<void>;
      };
    }
  }
  
  export {};
  