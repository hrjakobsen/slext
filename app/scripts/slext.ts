import Dispatcher from './dispatcher';
import { File, FileUtils } from './file';
import * as $ from 'jquery';
import { Container, Inject, Service } from 'typedi';
import * as ace from 'ace-builds/src-noconflict/ace';
import { PageHook } from './pagehook.service';


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
            // First check if a project has been selected
            if (!/^.*sharelatex\.com\/project\/\S+$/.test(window.location.href))
                return;

            // Then check if the SL loading screen has finished
            if (document.getElementsByClassName('loading-screen').length)
                return;

            clearInterval(loadingTimer);
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

    private loadingFinished() {
        let mo = new MutationObserver(function (mutations, observer) {
            if (
                mutations[0].addedNodes.length != 0 ||
                mutations[0].removedNodes.length != 0
            ) {
                // Files have been added or removed from file tree
                this.updateFiles();
            }
        });
        this.updateFiles();
        this.setupListeners();
    }

    private setupListeners() {
        let self = this;
        let fileClickListener = $('html').on(
            'click',
            '.entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle',
            function (evt) {
                var el = this;
                let file = FileUtils.newFile(el);
                self.dispatch('FileSelected', file);
            }
        );

        document.addEventListener("slext_editorChanged", function (e) {
            self.dispatch("editorChanged");
        });
    }

    private updateFiles() {
        this._files = this.indexFiles();
        this.dispatch('FilesChanged');
    }


    private indexFiles() {
        let self = this;
        let files: Array<File> = [];
        $('file-entity > li.ng-scope .entity-name').each(function (
            index: number,
            element: Element
        ) {
            if (!FileUtils.isFile(element)) return;
            files.push(FileUtils.newFile(element));
        });
        return files;
    }

    public getFiles(): Array<File> {
        return this._files;
    }

    public currentFile() {
        let currentFile = $('file-entity > li.ng-scope.selected .entity-name');
        if (currentFile.length == 0) return null;
        if (FileUtils.isFile(currentFile[0])) {
            return FileUtils.newFile(currentFile[0]);
        }
        return null;
    }
}
