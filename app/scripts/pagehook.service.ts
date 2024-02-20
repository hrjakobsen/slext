import { Service } from "typedi";

@Service()
export class PageHook {
    public static inject(): void {
        const s = document.createElement("script");
        s.src = chrome.runtime.getURL("scripts/injected.js");
        s.onload = function () {
            s.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }

    public static initialize(): void {
        document.dispatchEvent(new Event("slext:initializeStoreWatchers"));
    }
}
