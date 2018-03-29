export default class Dispatcher {
    private listeners = new Map<String, Array<Function>>();

    protected dispatch(event: string, data?: any) {
        if (!this.listeners.has(event)) return;
        console.log('dispatching to', this.listeners.get(event));
        this.listeners.get(event)!.forEach(function(listener) {
            listener(data);
        });
    }

    public addEventListener(event: string, listener: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Array<Function>());
        }
        this.listeners.get(event)!.push(listener);
    }
}
