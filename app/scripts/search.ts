import { Slext } from './slext';
import { Service } from 'typedi';
import { File } from './file';
import * as $ from 'jquery';
import { Utils } from './utils';
import { PersistenceService } from './persistence.service';
import { Logger } from './logger';

@Service()
export class Search {
    private static box: string = require('../templates/searchbox.html');
    private static result: string = require('../templates/searchresult.html');
    box: JQuery<HTMLElement>;
    resultlist: JQuery<HTMLElement>;
    active = false;
    currentSelected = -1;

    constructor(private slext: Slext) {
        let self = this;
        this.box = $(Search.box);
        this.resultlist = this.box.children('.searchbox__results');
        $('body').append(this.box);

        $(document).keydown(function (e) {
            if (e.altKey && e.which == 80) {
                //Alt+P
                self.box.toggleClass('searchbox--active');
                self.active = !self.active;
                if (self.active) {
                    self.box.children('.searchbox__field').focus();
                    self.box.children('.searchbox__field').select();
                }
            } else if (e.which == 27) {
                //Esc
                self.close();
            }
        });

        this.box.on('keydown', '.searchbox__field', function (e) {
            if (e.which == 13) {
                //Enter press
                self.selectFile();
                return;
            }
            if (e.which == 38) {
                // Up
                self.select(self.currentSelected - 1);
                return;
            }
            if (e.which == 40) {
                // Down
                self.select(self.currentSelected + 1);
                return;
            }
        });

        this.box.on('input', '.searchbox__field', function (e) {
            let inputfield = $(this);
            let text = inputfield.val() as string;

            let fileMatches = self.slext
                .getFiles()
                .filter(function (file, index) {
                    return file.path.toLowerCase().startsWith(text.toLowerCase()) || file.name.startsWith(text.toLowerCase());
                });
            self.resultlist.empty();
            self.createList(fileMatches).forEach(x => {
                self.resultlist.append(x);
            });

            if (self.resultlist.children().length > 0) {
                self.select(0);
            }
        });
    }

    private close() {
        this.active = false;
        this.box.removeClass('searchbox--active');
    }

    private selectFile() {
        let selected = $('.searchbox__resultitem--selected');
        this.resultlist.removeClass('searchbox--active');
        let file = selected.data('t') as File;
        $(file.handle).click();
        this.close();
    }

    private select(index: number) {
        let numChildren = this.resultlist.children().length;
        if (numChildren <= 0) return;
        this.currentSelected = Math.max(Math.min(index, numChildren - 1), 0);
        $('.searchbox__resultitem--selected').removeClass(
            'searchbox__resultitem--selected'
        );
        let newSelected = this.resultlist.children().get(this.currentSelected);
        newSelected.classList.add('searchbox__resultitem--selected');
    }

    private createList(files: File[]): JQuery<HTMLElement>[] {
        let self = this;
        let elements: JQuery<HTMLElement>[] = [];
        for (let i = 0; i < Math.min(5, files.length); i++) {
            let f = files[i];
            let match = $(Utils.format(Search.result, f));
            match.click(function (e) {
                self.select(i);
                self.close();
                $(f.handle).click();
            });
            match.data('t', f);
            elements.push(match);
        }
        return elements;
    }
}
