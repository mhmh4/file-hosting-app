import fs from "fs";
import path from "path";

function cleanUploadsDirectory(uploadsDirectoryPath) {
  if (!fs.existsSync(uploadsDirectoryPath)) {
    console.log(`Directory "${uploadsDirectoryPath}" doesn't exist.`);
    return;
  }

  const files = fs.readdirSync(uploadsDirectoryPath);

  if (files.length === 1 && files[0] === ".gitignore") {
    console.log(`Directory ${uploadsDirectoryPath} is already empty.`);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(uploadsDirectoryPath, file);
    const fileStat = fs.statSync(filePath);

    if (file === ".gitignore") {
      return;
    } else if (fileStat.isDirectory()) {
      cleanUploadsDirectory(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });

  console.log("Cleaned uploads directory.");
}

const uploadsDirectoryPath = "./uploads";
cleanUploadsDirectory(uploadsDirectoryPath);
