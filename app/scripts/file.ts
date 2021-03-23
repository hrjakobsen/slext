import * as $ from "jquery";
import { Slext } from "./slext";

export interface File {
    name: string;
    path: string;
    id: string;
    type: string;
}

export class FileUtils {
    public static newFile(name: string, path: string, id: string, type: string): File {
        return {
            name: name,
            path: path,
            id: id,
            type: type,
        };
    }
}
