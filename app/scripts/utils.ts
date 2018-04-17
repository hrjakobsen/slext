export class Utils {
    static format(str: string, obj: any): string {
        return str.replace(/{{(.*)}}/g, function (a, b: string) {
            let t = obj;
            let path = b.split('.');
            path.forEach(element => {
                t = t[element];
            });
            return t;
        });
    }
}
