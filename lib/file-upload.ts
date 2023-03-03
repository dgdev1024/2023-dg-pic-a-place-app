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
  console.log(exifData);

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

export const stripImageMetadata = (imageData: Buffer): Buffer => {
  // Get a data view of the buffer.
  const dataView = new DataView(imageData.buffer);

  // Make sure that this buffer contains valid JPEG image data.
  // JPEG data starts with the byte 0xFFD8 and ends with 0xFFD9.
  if (
    dataView.getUint16(0x00) !== 0xFFD8 ||
    dataView.getUint16(dataView.byteLength - 2) !== 0xFFD9
  ) {
    return imageData;
  }

  // Keep track of a byte offset.
  let offset = 0x02;

  // Keep track of the current application marker.
  let applicationMarker = dataView.getUint16(offset);

  // Keep an array of bytes making up the sanitized image header.
  const sanitizedHeaderBytes: number[] = [0xFF, 0xD8];

  // Iterate over the data view until either the end is reached, or the
  // Start of Stream marker 0xFFDA is found.
  while (offset < dataView.byteLength) {
    // If the marker encountered is the Start of Stream marker (0xFFDA), then
    // that is the end of the header. Break here.
    if (applicationMarker === 0xFFDA) {
      break;
    }

    // If the marker encountered is one of the Application markers (APP1 to APP15
    // (0xFFE1 to 0xFFEF)), then omit that marker's data.
    else if (
      applicationMarker >= 0xFFE1 &&
      applicationMarker <= 0xFFEF
    ) {
      // The two bytes after this marker indicates the size of that marker's data.
      // Advance the offset by this size plus the two bytes of this marker.
      offset += 2;
      offset += dataView.getUint16(offset);
    }

    else {
      // Push the two bytes of the marker, first.
      sanitizedHeaderBytes.push(dataView.getUint8(offset++));
      sanitizedHeaderBytes.push(dataView.getUint8(offset++));

      // Get the size of the marker's data.
      const dataLength = dataView.getUint16(offset);

      // Iterate over the bytes of this marker and add them in.
      for (let index = 0; index < dataLength; ++index) {
        sanitizedHeaderBytes.push(dataView.getUint8(offset + index));
      }

      // Advance the offset by the data length.
      offset += dataLength;
    }
    
    // At this point, the byte offset should be at the location of the next
    // marker. Get that marker
    applicationMarker = dataView.getUint16(offset);
  }

  // Get a subarray of the image data starting at the offset.
  const actualImageData = Array.from(imageData.subarray(offset));
  return Buffer.from([...sanitizedHeaderBytes, ...actualImageData]);
};
