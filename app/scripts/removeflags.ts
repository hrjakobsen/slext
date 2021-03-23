import { Slext } from "./slext";
import * as $ from "jquery";
import { PersistenceService } from "./persistence.service";
import { Container, Service } from "typedi";
import { Settings } from "./settings";

@Service()
export class RemoveFlagsModule {
    private settings: Settings;

    constructor(private slext: Slext) {
        // This does not work with constructor injection, and I don't know why
        this.settings = Container.get(Settings);
        this.settings.addEventListener("flagsChanged", (e) => this.setFlags(e));
        this.settings.addEventListener("cursorsChanged", (e) => this.setCursors(e));
        this.initialSetup();
    }

    private initialSetup(): void {
        PersistenceService.load("flags", (x) => {
            x = x || false;
            this.setClasses("flags", x);
        });
        PersistenceService.load("cursors", (x) => {
            x = x || false;
            this.setClasses("cursors", x);
        });
    }

    public setFlags(hidden: boolean): void {
        this.setElement("flags", hidden);
    }

    public setCursors(hidden: boolean): void {
        this.setElement("cursors", hidden);
    }

    private setElement(element: string, hidden: boolean): void {
        this.setClasses(element, hidden);
    }

    private setClasses(element: string, hidden: boolean): void {
        if (hidden) {
            $("#editor").addClass(element + "_hidden");
        } else {
            $("#editor").removeClass(element + "_hidden");
        }
    }
}
