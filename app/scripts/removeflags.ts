import { Slext } from './slext';
import { File } from './file';
import * as $ from 'jquery';
import { Utils } from './utils';
import { PersistenceService } from './persistence.service';
import { Container, Service, Inject } from "typedi";
import { Settings } from './settings';
import { TabModule } from './tabs';


@Service()
export class RemoveFlagsModule {

    private settings: Settings;

    constructor(private slext: Slext) {
        let self = this;
        // This does not work with constructor injection, and I don't know why
        this.settings = Container.get(Settings);
        this.settings.addEventListener("flagsChanged", (e) => self.setFlags(e));
        this.settings.addEventListener("cursorsChanged", (e) => self.setCursors(e));
        this.initialSetup();
    }

    private initialSetup() {
        let element = true;
        let self = this;
        PersistenceService.load("flags", x => {
            x = x || false;
            self.setClasses("flags", x);
        });
        PersistenceService.load("cursors", x => {
            x = x || false;
            self.setClasses("cursors", x);
        });
    }

    public setFlags(hidden) {
        this.setElement("flags", hidden);
    }

    public setCursors(hidden) {
        this.setElement("cursors", hidden);
    }

    private setElement(element: string, hidden: boolean) {
        let self = this;
        self.setClasses(element, hidden);
    }

    private setClasses(element, hidden) {
        if (hidden) {
            $("#editor").addClass(element + "_hidden");
        } else {
            $("#editor").removeClass(element + "_hidden");
        }
    }

}
