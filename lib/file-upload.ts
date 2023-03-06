/**
 * @file lib / file-upload.ts
 */

import { NextApiRequest } from "next";
import formidable from "formidable";
import * as piexifjs from 'piexifjs';
import * as streamifier from 'streamifier';
import * as uuid from 'uuid';
import { cloudinary } from "./cloudinary";

export type FormidableParseResult = {
  fields: formidable.Fields;
  files: formidable.Files;
};

export type ImageTagsData = {
  error?: string;
  status?: number;
  coords?: {
    latitude: number;
    longitude: number;
  },
  sanitizedImageData?: Buffer;
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

export const readThenSanitizeImageTags = async (imageData: Buffer): Promise<ImageTagsData> => {
  // Use piexifjs to load the image buffer's EXIF data.
  try {
    const exifData = piexifjs.load(imageData.toString('binary'));
    console.log(exifData);

    // Make sure the image's EXIF data includes geolocation data.
    if (
      !exifData.GPS[piexifjs.GPSIFD.GPSLatitude] ||
      !exifData.GPS[piexifjs.GPSIFD.GPSLongitude] ||
      !exifData.GPS[piexifjs.GPSIFD.GPSLatitudeRef] ||
      !exifData.GPS[piexifjs.GPSIFD.GPSLongitudeRef]
    ) {
      return {
        error: "The image uploaded does not contain the proper geolocation data.",
        status: 400
      }
    }

    // Get the GPS location from the EXIF data.
    let latitude = exifData.GPS[piexifjs.GPSIFD.GPSLatitude];
    let longitude = exifData.GPS[piexifjs.GPSIFD.GPSLongitude];
    const latitudeRef = exifData.GPS[piexifjs.GPSIFD.GPSLatitudeRef];
    const longitudeRef = exifData.GPS[piexifjs.GPSIFD.GPSLongitudeRef];

    // Resolve the latitude and longitude data to degrees.
    latitude = piexifjs.GPSHelper.dmsRationalToDeg(latitude) *
      (latitudeRef === 'N' ? 1 : -1);
    longitude = piexifjs.GPSHelper.dmsRationalToDeg(longitude) *
      (longitudeRef === 'E' ? 1 : -1);

    // Get the orientation and dimensions of the image.
    const orientation = exifData['0th'][piexifjs.ImageIFD.Orientation];
    const dimensions = {
      x: exifData['Exif'][piexifjs.ExifIFD.PixelXDimension],
      y: exifData['Exif'][piexifjs.ExifIFD.PixelYDimension]
    };

    // Create the sanitized EXIF data.
    const zeroth = {};
    const exif = {};
    const gps = {};
    zeroth[piexifjs.ImageIFD.Orientation] = orientation;
    exif[piexifjs.ExifIFD.PixelXDimension] = dimensions.x;
    exif[piexifjs.ExifIFD.PixelYDimension] = dimensions.y;
    const sanitizedExifData = {
      "0th": zeroth,
      "GPS": gps,
      "Exif": exif
    };
    const sanitizedExifBytes = piexifjs.dump(sanitizedExifData);

    // Remove the original EXIF data from the image and insert the sanitized data.
    let sanitizedImageData = piexifjs.remove(imageData.toString('binary'));
    sanitizedImageData = piexifjs.insert(sanitizedExifBytes, sanitizedImageData);

    return {
      coords: { latitude, longitude },
      sanitizedImageData: Buffer.from(sanitizedImageData, 'binary')
    };
  } catch (err) {
    console.error(err);
    return { error: "Failed to load EXIF data from image.", status: 500 };
  }
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
