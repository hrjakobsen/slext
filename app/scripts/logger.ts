export class Logger {
    public static error(...args: any[]) {
        if (process.env.NODE_ENV != 'development') return;
        console.error.apply(this, args);
    }
    public static log(...args: any[]) {
        if (process.env.NODE_ENV != 'development') return;
        console.log.apply(this, args);
    }
    public static warn(...args: any[]) {
        if (process.env.NODE_ENV != 'development') return;
        console.warn.apply(this, args);
    }
    public static debug(...args: any[]) {
        if (process.env.NODE_ENV != 'development') return;
        console.debug.apply(this, args);
    }
}