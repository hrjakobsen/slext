import { Slext } from "./slext";
import * as $ from "jquery";
import { PersistenceService } from "./persistence.service";
import { Container, Service } from "typedi";
import { Settings } from "./settings";

@Service()
export class ElementHiderModule {
    private settings: Settings;

    constructor(private slext: Slext) {
        // This does not work with constructor injection, and I don't know why
        this.settings = Container.get(Settings);
        this.initialSetup();
    }

    private initialSetup(): void {
        const objectsToHide = [
            { setting: "flags", event: "flagsChanged", default: false },
            { setting: "cursors", event: "cursorsChanged", default: false },
            { setting: "comments_highlight", event: "comments_highlightChanged", default: false },
            { setting: "comments_underline", event: "comments_underlineChanged", default: false },
        ];

        objectsToHide.forEach((o) => {
            this.settings.addEventListener(o.event, (e) => this.setClasses(o.setting, e));
            PersistenceService.load(o.setting, (x) => {
                x = x || o.default;
                this.setClasses(o.setting, x);
            });
        });
    }

    private setClasses(element: string, hidden: boolean): void {
        if (hidden) {
            $("#editor").addClass(element + "_hidden");
        } else {
            $("#editor").removeClass(element + "_hidden");
        }
    }
}
