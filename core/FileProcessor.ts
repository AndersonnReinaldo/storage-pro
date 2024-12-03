import path from "path";
import multer from "multer";
import { _root, wwwroot } from "../utils.js";
import { RequestFile } from "./RequestFile.js";
import sharp from "sharp";
import fs from "fs";

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "audio/mp3": "mp3",
  "application/javascript": "js",
  "application/json": "json",
  "application/xml": "xml",
  "text/plain": "txt",
  "text/html": "html",
  "text/css": "css",
  "text/javascript": "js",
};

const methodHandler = {
    POST: async (req: any): Promise<void> => {
        const request = {
            projectName: req.query.projectName,
            projectScope: req.query.projectScope,
        };
    }, 
    PUT: async  (req: any): Promise<void>=> {
        const request = {
            projectName: req.query.projectName,
            projectScope: req.query.projectScope,
            oldFileName: req.query.oldFileName
        };

        if (request.oldFileName) {
            console.log(request.oldFileName);
            await RequestFile.deleteFile(path.join(wwwroot, request.projectName, request.projectScope, request.oldFileName));
        }
    },
}

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    let path;

    try {
      //@ts-ignore
      await methodHandler[req.method](req);
      const prepare = await RequestFile.preparePath((req.query as any).projectName, (req.query as any).projectScope);
      path = prepare.path;
    } catch (error) {
      req._destroy(error as Error, d => {
        console.log(d);
      })

      console.log(error)
    }

    callback(null, path!);

  },
  filename: (req, file, callback) => {
    const lastDot = file.originalname.lastIndexOf(".");
    const name = file.originalname.slice(0, lastDot).split(" ").join("_");
    const extensionFile = file.originalname.slice(lastDot + 1);
    const extension = MIME_TYPES[file.mimetype as keyof typeof MIME_TYPES] || 
                      (Object.values(MIME_TYPES).includes(extensionFile) 
                              ? extensionFile 
                              : "txt");

    console.log(lastDot, name, extensionFile, extension);
    callback(null, `${name}.${extension}`);
  },
});

export const FileProcessor = multer({ storage: storage, fileFilter: (req, file, cb) => {
  cb(null, true);
} }).array("file", 5);


export const resizeImage = async (req: any, res: any, next: any) => {
  if (!req.files) {
    return next();
  }

  try {
    await Promise.all(
      req.files.map(async (file: any) => {
        const isImage = ["image/jpg", "image/jpeg", "image/png"].includes(file.mimetype);

        if (isImage) {
          const filePath = path.join(file.destination, file.filename);
          const tempOutputPath = path.join(file.destination, `temp-${file.filename}`);

          // Mantém o formato original ao redimensionar
          await sharp(filePath)
            .resize(800, 800, {
              fit: sharp.fit.inside,
              withoutEnlargement: true,
            })
            .toFile(tempOutputPath);

          // Substitui o arquivo original pelo redimensionado
          fs.unlinkSync(filePath);
          fs.renameSync(tempOutputPath, filePath);
        } else {
          console.log(`Arquivo ignorado no redimensionamento: ${file.filename}`);
        }
      })
    );

    next();
  } catch (error) {
    next(error);
  }
};

