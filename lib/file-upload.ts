/**
 * @file lib / file-upload.ts
 */

import { NextApiRequest } from "next";
import formidable from "formidable";
import ExifReader from 'exifreader';
import * as streamifier from 'streamifier';
import * as uuid from 'uuid';
import { cloudinary } from "./cloudinary";

export type FormidableParseResult = {
  fields: formidable.Fields;
  files: formidable.Files;
};

export type ImageGeotagData = {
  error?: string;
  coords?: {
    latitude: number;
    longitude: number;
  }
};

export const ImageMimeTypes: string[] = [
  'image/jpeg'
];

export const parseForm = async (
  req: NextApiRequest,
  options?: formidable.Options
): Promise<FormidableParseResult> => {
  const form = formidable(options);

  return await new Promise<FormidableParseResult>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
      }

      resolve({ fields, files });
    });
  });
};

export const isFileImage = (file: formidable.File): boolean => {
  return ImageMimeTypes.some((mimeType) => 
    file.mimetype === mimeType);
};

export const readImageGeotag = async (imageData: Buffer): Promise<ImageGeotagData> => {
  // Load the EXIF data from the image.
  const exifData = await ExifReader.load(imageData);

  // Ensure that the loaded EXIF data contains coordinate data.
  if (!exifData.GPSLatitude || !exifData.GPSLongitude) {
    return { error: "The image uploaded does not contain the proper geolocation data." };
  }

  // console.log(exifData.GPSLatitude, exifData.GPSLongitude);
  // console.log(exifData.GPSLatitudeRef, exifData.GPSLongitudeRef);

  // Get the coordinate data.
  let latitude = parseFloat(exifData.GPSLatitude.description);
  let longitude = parseFloat(exifData.GPSLongitude.description);

  // Get the cardinal directions of the coordinates.
  const cardinalLatitude = exifData.GPSLatitudeRef.value[0];
  const cardinalLongitude = exifData.GPSLongitudeRef.value[0];

  // Negate the coordinate datas, if necessary.
  if (cardinalLatitude === 'S') { latitude *= -1; }
  if (cardinalLongitude === 'W') { longitude *= -1; }

  return {
    coords: { latitude, longitude }
  };
};

export const uploadImageData = (
  imageData: Buffer, 
  locationName: string
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
      folder: `pic-a-place/${locationName}`,
      public_id: uuid.v4(),
      force_strip: true
    }, (error, result) => {
      if (error) { return reject(error); }

      return resolve(result);
    });

    streamifier.createReadStream(imageData).pipe(uploadStream);
  });
};
