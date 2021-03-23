import { Slext } from "./slext";
import * as $ from "jquery";
import { PersistenceService } from "./persistence.service";
import { Container, Service } from "typedi";
import { Settings } from "./settings";

@Service()
export class InvertPdfModule {
    private settings: Settings;

    constructor(private slext: Slext) {
        this.settings = Container.get(Settings);
        this.settings.addEventListener("invert_pdfChanged", (e) => this.setStyle(e));
        this.initialSetup();
    }

    private initialSetup() {
        PersistenceService.load("invert_pdf", (x) => {
            x = x || false;
            this.setStyle(x);
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
