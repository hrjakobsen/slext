export class PersistenceService {
    private static getProjectId(): string {
        let url: string = location.href;

        let matches = url.match(/.*\.sharelatex\.com\/project\/([a-zA-Z0-9]*)/);
        if (matches != null && matches.length < 2) return matches[1];

        matches = url.match(/.*\.sharelatex\.com\/read\/([a-zA-Z0-9]*)/);
        if (matches != null && matches.length < 2) return matches[1];

        matches = url.match(/.*\.sharelatex\.com\/([0-9]{10}[a-z]{12})/);
        if (matches != null && matches.length < 2) return matches[1];

        return '';

    }

    public static saveLocal(key: string, object: any) {
        let project = PersistenceService.getProjectId();
        return PersistenceService.save(key + project, object);
    }

    public static loadLocal(key: string, object: any) {
        let project = PersistenceService.getProjectId();
        return PersistenceService.load(key + project, object);
    }

    public static save(key: string, object: any) {
        let projectKey = "slext_" + key;
        localStorage.setItem(projectKey, JSON.stringify(object));
    }

    public static load(key: string, callback: any): any {
        if (!callback) callback = (response) => null;
        let projectKey = "slext_" + key;

        let item = localStorage.getItem(projectKey);
        if (item === undefined || item == null) callback(null);
        callback(JSON.parse(item));
    }
}
