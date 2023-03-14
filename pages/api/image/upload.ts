/**
 * @file pages / api / image / upload.ts
 */

import { NextApiRequest, NextApiResponse } from "next";
import { File } from 'formidable';
import prisma from '@lib/prismadb';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { isFileImage, parseForm, readThenSanitizeImageTags, uploadImageData } from "@lib/file-upload";
import { readFile } from "fs/promises";
import { resolveCoords } from "@lib/resolve-coords";

export type ImageUploadResponse = {
  error?: string;
  place?: {
    imageUrl: string;
    id: string;
  }
};

export const config = {
  api: { bodyParser: true }
};

const Handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ImageUploadResponse>
) => {
  // Make sure the correct HTTP method is used.
  if (req.method != 'POST') {
    return res.status(405).json({ error: "This method is not allowed." });
  }

  // Make sure the uploading user is signed in.
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "You are not logged in." });
  }

  // Fetch the image file from the form data.
  const formData = await parseForm(req, { allowEmptyFiles: true }); 
  const imageFile = formData.files.imageFile[0] as File; 

  // Make sure the file uploaded is a supported image.
  if (isFileImage(imageFile) === false) {
    return res.status(400).json({ error: "The file uploaded is not a supported image file. " });
  }

  // Read the contents of the image file and its EXIF data.
  const imageData = await readFile(imageFile.filepath);
  const imageGeotag = await readThenSanitizeImageTags(imageData);
  if (imageGeotag.error) {
    return res.status(imageGeotag.status || 500).json({ error: imageGeotag.error });
  }

  // Use Nominatim's reverse geocoding API to resolve the retrieved latitude and longitude
  // coordinates to a city, county, state and country name.
  const resolvedCoords = await resolveCoords(
    imageGeotag.coords.latitude, 
    imageGeotag.coords.longitude
  );
  if (resolvedCoords.error) {
    return res.status(resolvedCoords.status || 500).json({ error: resolvedCoords.error });
  }

  try {
    // Next, upload the image to Cloudinary.
    const uploadResult = await uploadImageData(imageGeotag.sanitizedImageData,
      resolvedCoords.place.id);

    // Finally, update the database.
    const insertedPicture = await prisma.picture.create({
      data: {
        userId: session.user.id,
        locationId: resolvedCoords.place.id,
        url: uploadResult.secure_url
      }
    });

    return res.status(200).json({
      place: {
        imageUrl: insertedPicture.url,
        id: insertedPicture.locationId
      }
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong while uploading the image. Try again later." });
  }
};

export default Handler;
