export {};

declare global {
  interface TestGlobalCheck {
    test: string;
  }
  
  interface Window {
    electronAPI: {
      getUserPreferences: () => Promise<{ theme: string }>;
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
  