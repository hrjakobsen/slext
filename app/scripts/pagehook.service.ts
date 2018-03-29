import { Service } from 'typedi';

@Service()
export class PageHook {
    public static evaluateJS(variable: string): Promise<any> {
        let promise = new Promise<any>((accept, resolve) => {
            let query = new CustomEvent("variable_query", { detail: variable });
            let eventListener = (res: CustomEvent) => {
                document.removeEventListener("variable_query_" + variable, eventListener);
                accept(res.detail);
            };
            document.addEventListener("variable_query_" + variable, eventListener);
            document.dispatchEvent(query);
        });
        return promise;
    };

    public static initialize() {
        let s = document.createElement('script');
        s.src = chrome.extension.getURL('scripts/injected.js');
        s.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }

    public static call(fun: Function, args?: Array<string>): Promise<any> {
        args = args || [];
        let jscode = `(${String(fun)})(${args.map(x => "\"" + x + "\"").join(", ")});`;
        return PageHook.evaluateJS(jscode);
    }
}
