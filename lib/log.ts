export interface SaveLogEntry {
  timestamp: Date;
  key: string;
  action: 'save' | 'conflict' | 'error' | 'retry';
  outcome: 'success' | 'failure' | 'conflict' | 'retry';
  error?: string;
  version?: number;
  retryCount?: number;
}

class SaveLogger {
  private logs: SaveLogEntry[] = [];
  private maxLogs = 100; // Keep last 100 entries

  log(entry: Omit<SaveLogEntry, 'timestamp'>) {
    const logEntry: SaveLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.logs.unshift(logEntry); // Add to beginning
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SaveLog] ${logEntry.action.toUpperCase()}: ${logEntry.outcome}`, {
        key: logEntry.key,
        version: logEntry.version,
        error: logEntry.error,
        retryCount: logEntry.retryCount,
      });
    }
  }

  getRecentLogs(limit: number = 10): SaveLogEntry[] {
    return this.logs.slice(0, limit);
  }

  getLogsForPrompt(key: string, limit: number = 20): SaveLogEntry[] {
    return this.logs
      .filter(log => log.key === key)
      .slice(0, limit);
  }

  clear() {
    this.logs = [];
  }

  export(): SaveLogEntry[] {
    return [...this.logs];
  }
}

export const saveLogger = new SaveLogger();

