import * as $ from 'jquery';

export interface File {
    name: string;
    path: string;
    handle: Element;
}

export class FileUtils {
    public static newFile(element: Element): File {
        let name = FileUtils.getName(element);
        let path = FileUtils.getPath(element);
        return {
            name: name,
            path: path + name,
            handle: element
        };
    }

    private static getPath(element: Element): string {
        let path = '';
        let folders = $(element)
            .parentsUntil('div[ng-if="rootFolder"]')
            .filter('div[ng-if="entity.type == \'folder\'"]');
        folders
            .get()
            .reverse()
            .forEach(function(element: Element, index: number) {
                let folderNameEl = $(element)
                    .find('div div span.ng-binding')
                    .first();
                path += folderNameEl.text().trim() + '/';
            });
        return path;
    }

    private static getName(element: Element): string {
        return $(element)
            .find('span.ng-binding')
            .eq(0)
            .text()
            .replace(' ', '');
    }

    public static isFile(el: Element): boolean {
        return $(el)
            .parent()
            .is('div.entity[ng-if="entity.type != \'folder\'"]');
    }
}
