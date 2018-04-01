export class PersistenceService {
    private static getProjectId(): string {
        let url: string = location.href;
        let matches = url.match(/.*\.sharelatex\.com\/project\/([a-zA-Z0-9]*)/);
        if (matches == null || matches.length < 2) return '';
        return matches[1];
    }

    public static save(key: string, object: any) {
        let project = PersistenceService.getProjectId();
        let projectKey = "slext_" + project + key;
        localStorage.setItem(projectKey, JSON.stringify(object));
    }

    public static load(key: string, callback: any): any {
        if (!callback) callback = (response) => null;
        let project = PersistenceService.getProjectId();
        let projectKey = "slext_" + project + key;

        let item = localStorage.getItem(projectKey);
        if (item === undefined || item == null) callback(null);
        callback(JSON.parse(item));
    }
}
