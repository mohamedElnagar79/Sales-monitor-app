const match = require("assert");
const fs = require("fs");
const mime = require("mime");
mime.define({ "image/jpg": [`jpg`] }, true);
const files_extensions = ["png", "jpg", "jpeg", "pdf", "docx", "xlsx", "txt"];

exports.uploadFilesAndPdf = (data, filesnames, path) => {
  if (!Array.isArray(data)) {
    data = [data]; // Convert single data to an array
  }
  if (!Array.isArray(filesnames)) {
    filesnames = [filesnames]; // Convert single filesnames to an array
  }
  let extension, type, buffer;
  let docodedImgAndPdf, decodedDocx, decodedExcelSheet;
  const uploadedFilesInfo = [];
  data.forEach((item, index) => {
    decodedExcelSheet = item.match(
      /^data:application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet;base64,(.+)$/
    );
    docodedImgAndPdf = item.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    decodedDocx = item.match(
      /^data:application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document;base64,(.+)$/
    );
    decodedTxtFile = item.match(/^data:text\/plain;base64,([^;]+)$/);
    if (decodedTxtFile) {
      let txtData = Buffer.from(decodedTxtFile[1], "base64");
      buffer = txtData;
      extension = "txt";
      type = "file";
    }
    if (decodedExcelSheet) {
      let xlsData = Buffer.from(decodedExcelSheet[1], "base64");
      type = "file";
      buffer = xlsData;
      extension = "xlsx";
    }
    if (docodedImgAndPdf) {
      const response = {
        type: docodedImgAndPdf[1],
        data: Buffer.from(docodedImgAndPdf[2], "base64"),
      };
      buffer = response.data;
      type = response.type;
      extension = mime.getExtension(type);
    }

    if (decodedDocx) {
      let docxData = Buffer.from(decodedDocx[1], "base64");
      buffer = docxData;
      type = "file";
      extension = "docx";
    }
    if (index < filesnames.length) {
      if (extension != undefined && buffer != undefined) {
        if (!files_extensions.includes(extension)) {
          throw new Error(`${getMyLang().__("invalidExtension")}`);
        }
        console.log("filesnames");
        let fileName = `${filesnames[index]}-${
          (new Date().getTime() / 1000) | 0
        }${index}.${extension}`;
        fileName.replaceAll(" ", "-");
        try {
          fs.writeFileSync(
            `${process.cwd()}/public/${
              type.startsWith("image") ? "images" : "files"
            }/${path}/` + fileName,
            buffer,
            "utf8"
          );
          uploadedFilesInfo.push({ fileName, extension });
          buffer = undefined;
          extension = undefined;
          type = undefined;
          return uploadedFilesInfo;
        } catch (e) {
          throw new Error(e);
        }
      } else {
        throw new Error(`${getMyLang().__("invalidExtension")}`);
      }
    } else {
      throw new Error(`${getMyLang().__("filenames")}`);
    }
  });
  return uploadedFilesInfo;
};
