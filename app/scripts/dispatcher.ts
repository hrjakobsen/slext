export type Listener = (d: any) => any;

export class Dispatcher {
    protected listeners = new Map<string, Array<Listener>>();

    protected dispatch(event: string, data?: any): void {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(function (listener) {
            listener(data);
        });
    }

    public addEventListener(event: string, listener: Listener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Array<Listener>());
        }
        this.listeners.get(event).push(listener);
    }
}
