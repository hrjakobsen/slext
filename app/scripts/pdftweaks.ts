import { Slext } from "./slext";
import * as $ from "jquery";
import { PersistenceService } from "./persistence.service";
import { Container, Service } from "typedi";
import { Settings } from "./settings";

@Service()
export class PdfTweaksModule {
    private settings: Settings;

    constructor(private slext: Slext) {
        this.settings = Container.get(Settings);
        this.settings.addEventListener("invert_pdfChanged", (e) => this.setStyle(e));
        this.settings.addEventListener("pdf_paddingChanged", (e) => this.setPadding(e));
        this.initialSetup();
    }

    private initialSetup() {
        PersistenceService.load("invert_pdf", (x) => {
            x = x || false;
            this.setStyle(x);
        });
        PersistenceService.load("pdf_padding", (x) => {
            x = x || false;
            this.setPadding(x);
        });
    }

    private setStyle(hidden) {
        if (hidden) {
            $(".pdf, .pdf .toolbar.toolbar-pdf, .pdf-logs").addClass("slext-inverted");
        } else {
            $(".pdf, .pdf .toolbar.toolbar-pdf, .pdf-logs").removeClass("slext-inverted");
        }
    }

    private setPadding(enabled) {
        // We put the class on the body element, since .pdfjs-viewer-inner may not exist yet
        if (enabled) {
            $("body").addClass("slext-pdf-padding");
        } else {
            $("body").removeClass("slext-pdf-padding");
        }
    }
}
