import { Service } from "typedi";

@Service()
export class PageHook {
    public static evaluateJS(variable: string): Promise<any> {
        const promise = new Promise<any>((accept, _resolve) => {
            const query = new CustomEvent("variable_query", { detail: variable });
            const eventListener = (res: CustomEvent) => {
                document.removeEventListener("variable_query_" + variable, eventListener);
                accept(res.detail);
            };
            document.addEventListener("variable_query_" + variable, eventListener);
            document.dispatchEvent(query);
        });
        return promise;
    }

    public static initialize(): void {
        const s = document.createElement("script");
        s.src = chrome.extension.getURL("scripts/injected.js");
        s.onload = function () {
            s.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public static call(fun: Function, args?: Array<string>): Promise<any> {
        args = args || [];
        const jscode = `(${String(fun)})(${args.map((x) => '"' + x + '"').join(", ")});`;
        return PageHook.evaluateJS(jscode);
    }
}
