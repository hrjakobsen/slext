import { Dispatcher } from "./dispatcher";
import { File, FileUtils } from "./file";
import * as $ from "jquery";
import { Service } from "typedi";
import { PageHook } from "./pagehook.service";
import { Utils } from "./utils";

@Service()
export class Slext extends Dispatcher {
    private _files: Array<File> = [];
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
        return $(".full-size.ng-scope:not(.ng-hide)[ng-show=\"ui.view == 'pdf'\"]").length > 0;
    }

    public isHistoryOpen(): boolean {
        return $("#ide-body.ide-history-open").length > 0;
    }

    public goToFullScreenPDF(): void {
        const button = $('[ng-click="togglePdfView()"]');
        if (button.length) {
            (button[0] as HTMLElement).click();
        }
    }

    private loadingFinished(): void {
        const mo = new MutationObserver((mutations, _observer) => {
            if (mutations[0].addedNodes.length != 0 || mutations[0].removedNodes.length != 0) {
                // Files have been added or removed from file tree
                this.updateFiles();
            }
        });
        mo.observe(document.querySelector('select[name="rootDoc_id"]'), {
            childList: true,
            subtree: true,
        });
        this.updateFiles();
        this.setupListeners();
    }

    private setupListeners(): void {
        window.addEventListener("editor.openDoc", (e: CustomEvent) => {
            const file_id = e.detail;
            const matches = this._files.filter((f, _i) => f.id == file_id);
            const file = matches.length ? matches[0] : null;
            this.dispatch("FileSelected", file);
        });

        document.addEventListener("slext_editorChanged", (_e) => {
            this.dispatch("editorChanged");
        });

        $(document).on("click", '[ng-click="switchToSideBySideLayout()"], [ng-click="switchToFlatLayout()"]', () => {
            this.dispatch("layoutChanged");
        });
    }

    public updateFiles(): Promise<File[]> {
        return new Promise((resolve, _reject) => {
            this.indexFiles().then((files: Array<File>) => {
                this._files = files;
                this.dispatch("FilesChanged");
                resolve(this._files);
            });
        });
    }

    private indexFiles(): Promise<File[]> {
        return new Promise((resolve, _reject) => {
            PageHook.evaluateJS("_ide.$scope.docs").then((response: any) => {
                const res = response.map((f) => FileUtils.newFile(f.doc.name, f.path, f.doc.id, "doc"));
                resolve(res);
            });
        });
    }

    public getFiles(): Array<File> {
        return this._files;
    }

    public currentFile(): Promise<File> {
        return new Promise((resolve, reject) => {
            PageHook.evaluateJS("_ide.editorManager.$scope.editor.open_doc_id").then((id) => {
                const matches = this._files.filter((f, _i) => f.id == id);
                if (matches.length == 0) {
                    reject();
                }
                resolve(matches[0]);
            });
        });
    }

    public selectFile(file: File): void {
        if (this._files.filter((f) => f.id == file.id && f.path == file.path).length > 0) {
            PageHook.evaluateJS(
                "_ide.$scope.$emit('entity:selected', {type: '" +
                    file.type +
                    "', id:'" +
                    file.id +
                    "', name:'" +
                    file.name +
                    "'})"
            );
        }
    }
}
