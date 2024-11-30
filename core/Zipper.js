import * as AdmZip from "adm-zip";
export class Zipper {
    static async zipDirectory(directory, out) {
        return new Promise((resolve, reject) => {
            try {
                const outputFile = out.endsWith(".zip") ? out : `${out}.zip`;
                ;
                this._zip.addLocalFolder(directory);
                this._zip.writeZip(outputFile);
                console.log(`Created ${outputFile} successfully`);
                resolve(true);
            }
            catch (e) {
                console.log(`Something went wrong when zipping directory. ${e}`);
                reject(e);
            }
            finally {
                this._zip = new AdmZip.default();
            }
        });
    }
    static async zipFile(files, out) {
        return new Promise((resolve, reject) => {
            try {
                const outputFile = out.endsWith(".zip") ? out : `${out}.zip`;
                ;
                files.forEach(file => {
                    this._zip.addLocalFile(file);
                });
                this._zip.writeZip(outputFile);
                console.log(`Created ${outputFile} successfully`);
                resolve(true);
            }
            catch (e) {
                console.log(`Something went wrong when zipping files. ${e}`);
                reject(e);
            }
            finally {
                this._zip = new AdmZip.default();
            }
        });
    }
    static async unzipDirectory(source, out) {
        return new Promise((resolve, reject) => {
            try {
                var zip = new AdmZip.default(source);
                zip.extractAllTo(out, true);
                console.log(`Extracted all to ${out} successfully`);
                resolve(true);
            }
            catch (e) {
                console.log(`Something went wrong when unzipping. ${e}`);
                reject(e);
            }
        });
    }
}
Zipper._zip = new AdmZip.default();
