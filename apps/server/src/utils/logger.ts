import { env } from './env';

export enum LoggerLever {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

export interface LoggerConfig {
    level: LoggerLever;
}

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
    level: LoggerLever.INFO,
};

export class Logger {
    private readonly config: LoggerConfig;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
    }

    debug(...message: unknown[]) {
        // eslint-disable-next-line no-console
        console.debug(this.formatMessage(LoggerLever.DEBUG, ...message));
    }

    info(...message: unknown[]) {
        // eslint-disable-next-line no-console
        console.info(this.formatMessage(LoggerLever.INFO, ...message));
    }

    warn(...message: unknown[]) {
        console.warn(this.formatMessage(LoggerLever.WARN, ...message));
    }

    error(...message: unknown[]) {
        console.error(this.formatMessage(LoggerLever.ERROR, ...message));
    }

    private formatMessage(level: LoggerLever, ...message: unknown[]): string {
        return `${new Date().toISOString()} [${LoggerLever[level]}] ${message.join('  ')}`;
    }
}

export const logger = new Logger({ level: env.LOG_LEVEL });
