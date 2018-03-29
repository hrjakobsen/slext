export class PersistenceService {
    private static getProjectId(): string {
        let url: string = location.href;
        let matches = url.match(/.*\.sharelatex\.com\/project\/([a-zA-Z0-9]*)/);
        if (matches == null || matches.length < 2) return '';
        return matches[1];
    }

    public static save(key: string, object: any, callback: any) {
        let project = PersistenceService.getProjectId();
        let projectKey = project + key;
        let obj: any = {};

        obj[projectKey] = object;

        chrome.storage.local.set(obj, callback);
    }

    public static load(key: string, callback: any): any {
        let project = PersistenceService.getProjectId();
        let projectKey = project + key;

        chrome.storage.local.get(projectKey, res => {
            if (res[projectKey]) callback(res[projectKey]);
            else callback(null);
        });
    }
}
