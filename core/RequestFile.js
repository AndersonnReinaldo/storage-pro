import fs from 'fs';
import path from 'path';
import { wwwroot } from "../utils.js";
export var FileStatus;
(function (FileStatus) {
    FileStatus[FileStatus["ERROR"] = -1] = "ERROR";
    FileStatus[FileStatus["NOT_FOUND"] = 1] = "NOT_FOUND";
    FileStatus[FileStatus["SUCCESS"] = 2] = "SUCCESS";
})(FileStatus || (FileStatus = {}));
export class RequestFile {
    constructor(fileName, projectName, projectScope) {
        this.fileName = fileName;
        this.projectName = projectName;
        this.projectScope = projectScope;
        this.filePath = path.join(wwwroot, projectName, projectScope, fileName);
        console.log(this.filePath);
    }
    async readFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filePath, (err, data) => {
                if (err) {
                    if (["ENOENT", "ENOTDIR"].includes(err.code)) {
                        return reject(ResponseFile.NOT_FOUND);
                    }
                    return reject(new ResponseFile(FileStatus.ERROR, null, err));
                }
                return resolve(new ResponseFile(FileStatus.SUCCESS, data.toString("base64"), err));
            });
        });
    }
    async deleteFile() {
        return RequestFile.deleteFile(this.filePath);
    }
    async preparePath() {
        return RequestFile.preparePath(this.projectName, this.projectScope);
    }
    static validJoin(...args) {
        if (args.some(a => a === "wwwroot")) {
            return false;
        }
        return args.some(arg => arg instanceof String);
    }
    static async preparePath(projectName, projectScope) {
        return new Promise((resolve, reject) => {
            if (!this.validJoin(projectName, projectScope)) {
                //return reject(new ResponseFile(FileStatus.ERROR, null, "Invalid projectName"));
            }
            const path_ = path.join([wwwroot, projectName, projectScope].filter(a => a && a != " ").join("/"));
            fs.mkdir(path_, { recursive: true }, (err) => {
                if (err) {
                    reject(new ResponseFile(FileStatus.ERROR, null, err));
                }
                resolve(ResponseFile.fromPath(path_).SUCCESS);
            });
        });
    }
    static async deleteFile(filePath) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                return resolve(ResponseFile.NOT_FOUND);
            }
            fs.unlink(filePath, (err) => {
                if (err) {
                    return resolve(new ResponseFile(FileStatus.ERROR, null, err));
                }
                return resolve(ResponseFile.fromPath(filePath).SUCCESS);
            });
        });
    }
}
export class ResponseFile {
    constructor(status, data, error, path) {
        this.status = status;
        this.error = error;
        this.data = data;
        this.path = path;
    }
}
ResponseFile.fromPath = (path) => {
    return {
        SUCCESS: new ResponseFile(FileStatus.SUCCESS, null, null, path),
        ERROR: new ResponseFile(FileStatus.ERROR, null, null, path)
    };
};
ResponseFile.NOT_FOUND = new ResponseFile(FileStatus.NOT_FOUND, null, null);
ResponseFile.ERROR = new ResponseFile(FileStatus.ERROR, null, null);
ResponseFile.SUCCESS = new ResponseFile(FileStatus.SUCCESS, null, null);
