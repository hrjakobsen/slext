import { Slext } from "./slext";
import { File } from "./file";
import * as $ from "jquery";
import { Utils } from "./utils";
import { PersistenceService } from "./persistence.service";
import { Container, Service, Inject } from "typedi";
import { Settings } from "./settings";
import { TabModule } from "./tabs";

@Service()
export class InvertPdfModule {
    private settings: Settings;

    constructor(private slext: Slext) {
        let self = this;
        this.settings = Container.get(Settings);
        this.settings.addEventListener("invert_pdfChanged", (e) => self.setStyle(e));
        this.initialSetup();
    }

    private initialSetup() {
        let element = true;
        let self = this;
        PersistenceService.load("invert_pdf", (x) => {
            x = x || false;
            self.setStyle(x);
        });
    }

    private setStyle(hidden) {
        if (hidden) {
            $(".pdf, .pdf .toolbar.toolbar-pdf, .pdf-logs").addClass("slext-inverted");
        } else {
            $(".pdf, .pdf .toolbar.toolbar-pdf, .pdf-logs").removeClass("slext-inverted");
        }
    }
}
