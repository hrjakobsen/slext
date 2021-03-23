export class Utils {
    static format(str: string, obj: any): string {
        return str.replace(/{{(.*?)}}/g, function (a, b: string) {
            let t = obj;
            let path = b.split(".");
            path.forEach((element) => {
                t = t[element];
            });
            return t;
        });
    }

    static isShareLatex(url) {
        return (
            /^.*sharelatex\.com\/project\/\S+$/.test(url) ||
            /^.*sharelatex\.com\/read\/\S+$/.test(url) ||
            /^.*sharelatex\.com\/[0-9]{10}[a-z]{12}$/.test(url)
        );
    }

    static isOverleaf(url) {
        return (
            /^.*(v2\.)?overleaf\.com\/project\/\S+$/.test(url) ||
            /^.*(v2\.)?overleaf\.com\/read\/\S+$/.test(url) ||
            /^.*(v2\.)?overleaf\.com\/[0-9]{10}[a-z]{12}$/.test(url)
        );
    }
}
