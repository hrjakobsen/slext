import { Service, Container } from "typedi";
import { Slext } from "./slext";
import { Settings } from "./settings";
import { Dispatcher, Listener } from "./dispatcher";
import * as $ from "jquery";
import { PersistenceService } from "./persistence.service";

@Service()
export class Shortcut extends Dispatcher {
    private settings: Settings;
    private meta_key: string;
    private listeners_backup: [string, Listener][] = [];

    constructor(protected slext: Slext) {
        super();
        this.settings = Container.get(Settings);

        PersistenceService.load("meta_key", (meta_key) => {
            if (meta_key === null) {
                meta_key = "Alt";
            }
            this.meta_key = meta_key;
        });

        $(document).keydown((e) => {
            const nonEmpty = (s: string) => s.length > 0;

            const isLetterOrNumeral = (n) => (n >= 65 && n <= 90) || (n >= 48 && n <= 57);

            const furtherAllowed = new Map<number, string>([
                [13, "Enter"],
                [8, "Backspace"],
                [38, "Up"],
                [40, "Down"],
            ]);

            if (!isLetterOrNumeral(e.which) && !furtherAllowed.has(e.which)) return;
            const pressed = [
                isLetterOrNumeral(e.which) ? String.fromCharCode(e.which) : "",
                e.altKey ? "Alt" : "",
                e.ctrlKey ? "Ctrl" : "",
                e.metaKey ? "Cmd" : "",
                e.shiftKey ? "Shift" : "",
                furtherAllowed.has(e.which) ? furtherAllowed.get(e.which) : "",
            ].filter(nonEmpty);
            const dispatchString = pressed.sort().join("+");
            this.dispatch(dispatchString, e);
        });

        this.settings.addEventListener("meta_keyChanged", (value) => {
            this.meta_key = value;
            this.fixListeners();
        });
    }

    public addEventListener(event: string, listener: Listener): void {
        this.listeners_backup.push([event, listener]);
        const sortedEvents = event.replace(/Meta/g, this.meta_key).split("+").sort().join("+");
        super.addEventListener(sortedEvents, listener);
    }

    private fixListeners(): void {
        this.listeners.clear();
        this.listeners_backup.forEach((l) => {
            const sortedEvents = l[0].replace(/Meta/g, this.meta_key).split("+").sort().join("+");
            super.addEventListener(sortedEvents, l[1]);
        });
    }
}
