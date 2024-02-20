import { Dispatcher } from "./dispatcher";
import { File, FileUtils } from "./file";
import * as $ from "jquery";
import { Service } from "typedi";
import { Utils } from "./utils";

@Service()
export class Slext extends Dispatcher {
    private _files: Array<File> = [];
    private _currentlySelectedFile: File | null = null;
    private static id = 0;
    private loaded = false;

    id = -1;

    constructor() {
        super();
        this.id = Slext.id++;
        const loadingTimer = setInterval(() => {
            // Then check if the SL loading screen has finished
            if (document.getElementsByClassName("loading-screen").length) return;

            clearInterval(loadingTimer);
            document.body.classList.add(Utils.isShareLatex(window.location.href) ? "sharelatex" : "overleaf");
            document.body.classList.add("slext-loaded");
            this.loadingFinished();
            this.loaded = true;
        }, 200);
    }

    public isLoaded(): boolean {
        return this.loaded;
    }

    public getId(): number {
        return this.id;
    }

    public isFullScreenPDF(): boolean {
        return $(".full-size.ng-scope:not(.ng-hide)[ng-show=\"ui.view == 'pdf'\"],.pdf.full-size").length > 0;
    }

    public isFullScreenEditor(): boolean {
        return !this.isFullScreenPDF() && !this.isSplitScreen();
    }

    public isHistoryOpen(): boolean {
        return $("#ide-body.ide-history-open,.history-react").length > 0;
    }

    private _toggleFullScreenPDFEditor(): void {
        // There's no good way to select the togglePdf button anymore.
        // So we're using a very specific selector to hopefully avoid false hits.
        const button_icon = $("header.toolbar-header .toolbar-left + a.btn-full-height-no-border i.fa-file-pdf-o");

        if (button_icon.length) {
            (button_icon.parent()[0] as HTMLElement).click();
        }
    }

    public toggleFullScreenPDFEditor(): void {
        if (this.isSplitScreen()) this.goToFullScreenPDF();
        else this._toggleFullScreenPDFEditor();
    }

    public goToFullScreenEditor(): void {
        if (this.isSplitScreen()) {
            const button = $("[ng-click=\"switchToFlatLayout('pdf')\"]");
            if (button.length) {
                (button[0] as HTMLElement).click();
            }
        } else if (!this.isFullScreenEditor()) {
            this.toggleFullScreenPDFEditor();
        }
    }

    public goToFullScreenPDF(): void {
        if (this.isSplitScreen()) {
            let button = $("[ng-click=\"switchToFlatLayout('pdf')\"]");
            if (!button.length) {
                // Try to use the beta-feature button
                button = $(".toolbar-pdf-expand-btn");
            }
            if (button.length) {
                (button[0] as HTMLElement).click();
            }
        } else if (!this.isFullScreenPDF()) {
            this._toggleFullScreenPDFEditor();
        }
    }

    public goToSplitScreen(): void {
        if (!this.isSplitScreen()) {
            const button = $("[ng-click=\"switchToSideBySideLayout('editor')\"]");
            if (button.length) {
                (button[0] as HTMLElement).click();
            }
        }
    }

    public isSplitScreen(): boolean {
        return $("[ng-click=\"switchToFlatLayout('editor')\"]:not(.ng-hide)").length > 0;
    }

    private loadingFinished(): void {
        this.setupListeners();
    }

    private setupListeners(): void {
        document.addEventListener("slext:fileChanged", (e: CustomEvent) => {
            const file_id = e.detail;
            const matches = this._files.filter((f, _i) => f.id == file_id);
            const file = matches.length ? matches[0] : null;
            this._currentlySelectedFile = file;
            this.dispatch("FileSelected", file);
        });

        document.addEventListener("slext:setProject", (e: CustomEvent) => {
            this.updateFiles(e.detail);
        });

        $(document).on(
            "click",
            "[ng-click=\"switchToSideBySideLayout('editor')\"], " +
                "[ng-click=\"switchToFlatLayout('pdf')\"], " +
                "[ng-click=\"switchToFlatLayout('editor')\"] ",
            () => {
                this.dispatch("layoutChanged");
            }
        );
    }

    public updateFiles(project: any): Promise<File[]> {
        function getDocsFromFolder(folder, path) {
            const files = folder.docs.map((d) => FileUtils.newFile(d.name, path + "/" + d.name, d._id, "doc"));
            for (const subFolder of folder.folders) {
                files.push(...getDocsFromFolder(subFolder, path + "/" + subFolder.name));
            }
            return files;
        }
        return new Promise((resolve) => {
            const files = getDocsFromFolder(project.rootFolder[0], "");
            this._files = files;
            this.dispatch("FilesChanged");
            resolve(this._files);
        });
    }

    public getFiles(): Array<File> {
        return this._files;
    }

    public currentFile(): Promise<File> {
        return new Promise((resolve, reject) => {
            if (this._currentlySelectedFile) {
                resolve(this._currentlySelectedFile);
            } else {
                reject();
            }
        });
    }

    public selectFile(file: File): void {
        if (this._files.filter((f) => f.id == file.id && f.path == file.path).length > 0) {
            document.dispatchEvent(new CustomEvent("slext:doFileChange", { detail: file.id }));
        }
    }
}
