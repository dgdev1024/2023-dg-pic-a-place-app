/**
 * @file pages / api / image / upload.ts
 */

import { NextApiRequest, NextApiResponse } from "next";
import { File } from 'formidable';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { isFileImage, parseForm, readImageGeotag, stripImageMetadata } from "@lib/file-upload";
import { readFile } from "fs/promises";
import { fstat, writeFileSync } from "fs";

export type ImageUploadResponse = {
  error?: string;
};

export const config = {
  api: { bodyParser: false }
};

const Handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ImageUploadResponse>
) => {
  // Make sure the correct HTTP method is used.
  if (req.method != 'POST') {
    return res.status(405).json({ error: "This method is not allowed." });
  }

  // Fetch the image file from the form data.
  const formData = await parseForm(req, { allowEmptyFiles: true }); 
  const imageFile = formData.files.imageFile[0] as File; 

  // Make sure the file uploaded is a supported image.
  if (isFileImage(imageFile) === false) {
    return res.status(400).json({ error: "The file uploaded is not a supported image file. " });
  }

  // Read the contents of the image file and its EXIF data.
  let imageData = await readFile(imageFile.filepath);
  const imageGeotag = await readImageGeotag(imageData);
  if (imageGeotag.error) {
    return res.status(400).json({ error: imageGeotag.error });
  }

  console.log(imageGeotag);

  // We do not need the EXIF data anymore. Strip it.
  imageData = stripImageMetadata(imageData);
  writeFileSync(`${process.cwd()}/test.jpg`, imageData);

  return res.status(200).json({ error: "Good" });
};

export default Handler;
