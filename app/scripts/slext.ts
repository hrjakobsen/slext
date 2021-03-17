import Dispatcher from './dispatcher';
import { File, FileUtils } from './file';
import * as $ from 'jquery';
import { Container, Inject, Service } from 'typedi';
import { PageHook } from './pagehook.service';
import { Utils } from './utils';

@Service()
export class Slext extends Dispatcher {
    private _files: Array<File> = [];
    private static id = 0;
    private loaded = false;

    id = -1;

    constructor() {
        super();
        let self = this;
        this.id = Slext.id++;
        let loading = true;
        let loadingTimer = setInterval(function () {

            // Then check if the SL loading screen has finished
            if (document.getElementsByClassName('loading-screen').length)
                return;

            clearInterval(loadingTimer);
            document.body.classList.add(Utils.isShareLatex(window.location.href) ? "sharelatex" : "overleaf");
            document.body.classList.add("slext-loaded");
            self.loadingFinished();
            self.loaded = true;
        }, 200);
    }

    public isLoaded() {
        return this.loaded;
    }

    public getId() {
        return this.id;
    }

    public isFullScreenPDF(): boolean {
        return $(".full-size.ng-scope:not(.ng-hide)[ng-show=\"ui.view == 'pdf'\"]").length > 0;
    }

    public isHistoryOpen(): boolean {
        return $("#ide-body.ide-history-open").length > 0;
    }

    public goToFullScreenPDF() {
        $("[ng-click=\"togglePdfView()\"]").click();
    }

    private loadingFinished() {
        let self = this;
        let mo = new MutationObserver(function (mutations, observer) {
            if (
                mutations[0].addedNodes.length != 0 ||
                mutations[0].removedNodes.length != 0
            ) {
                // Files have been added or removed from file tree
                self.updateFiles();
            }
        });
        mo.observe(document.querySelector('select[name="rootDoc_id"]'), {childList: true, subtree: true });
        this.updateFiles();
        this.setupListeners();
    }

    private setupListeners() {
        let self = this;

        window.addEventListener("editor.openDoc", function(e : CustomEvent) {
            let file_id = e.detail;
            let matches = self._files.filter((f, i) => f.id == file_id);
            let file = matches.length ? matches[0] : null;
            self.dispatch('FileSelected', file);
        });

        document.addEventListener("slext_editorChanged", function (e) {
            self.dispatch("editorChanged");
        });

        $(document).on('click', '[ng-click="switchToSideBySideLayout()"], [ng-click="switchToFlatLayout()"]', function () {
            self.dispatch("layoutChanged");
        });
    }

    public updateFiles() {
        let self = this;
        return new Promise((resolve, reject) => {
            this.indexFiles().then((files : Array<File>) => {
                self._files = files;
                self.dispatch('FilesChanged');
                resolve(self._files);
            });
        });
        
    }


    private indexFiles() {
        return new Promise((resolve, reject) => {
            PageHook.evaluateJS("_ide.$scope.docs").then((response : any) => {
                let res = response.map(f => FileUtils.newFile(f.doc.name, f.path, f.doc.id, 'doc'))
                resolve(res);
            });
        });
    }

    public getFiles(): Array<File> {
        return this._files;
    }


    public currentFile() {
        return new Promise((resolve, reject) => {
            let self = this;
            PageHook.evaluateJS("_ide.editorManager.$scope.editor.open_doc_id").then(id => {
                let matches = self._files.filter((f, i) => f.id == id);
                if (matches.length == 0) {
                    reject();
                }
                resolve(matches[0])
            });
        }); 
    }


    public selectFile(file : File) {
        if (this._files.filter(f => f.id == file.id && f.path == file.path).length > 0) {
            PageHook.evaluateJS("_ide.$scope.$emit('entity:selected', {type: '" + file.type + "', id:'" + file.id + "', name:'" + file.name + "'})");
        }
    }
}
