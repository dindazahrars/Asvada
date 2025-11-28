import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

export default async function SaveFile(file, email) {
    console.log(file);

    if (!validateExtension(file.name)) return false;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = generateFilename(email, file.name);

    const uploadDir = path.join(process.cwd(), "dataUploads");

    await fs.promises.mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return `/dataUploads/${filename}`;
}


function validateExtension(filename) {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    return allowed.includes(ext);
}

function generateFilename(username, noSoal, filename) {
    const ext = filename.slice(filename.lastIndexOf('.'));
    const safeUser = username.replace(/[^a-zA-Z0-9]/g, "_");
    return `${safeUser}_${noSoal}${ext}`
}

// hasilnya cek dulu returnnya false / true baru simpen 