import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { FastifyRequest } from 'fastify';

// Receives the image as a stream from Fastify multipart
async function receiveImageStream(request: FastifyRequest): Promise<{ stream: NodeJS.ReadableStream, filename: string, extension: string } | null> {
	const anyReq = request as any;

	// ensure multipart is present
	if (typeof anyReq.isMultipart === 'function' && !anyReq.isMultipart()) {
		throw new Error('Request is not multipart/form-data');
	}

	// prefer the decorated .file() helper if available
	let data: any;
	if (typeof anyReq.file === 'function') {
		// read the first file in the form
		data = await anyReq.file();
	} else {
		console.error("receiveImageStream: Error while receiving stream");
		return null;
	}

	if (!data || !data.file) {
		console.error("receiveImageStream: Error while receiving stream");
		return null;
	}

	const original = (typeof data.filename === 'string' && data.filename.length) ? data.filename : `upload_img_profile`;
	const sanitizedFilename = original.replace(/[^a-zA-Z0-9._-]/g, '_');
	let extension = extname(sanitizedFilename);

	// Validate and set the extension based on mimetype
	const mimetype: string | undefined = data.mimetype;
	if (mimetype === 'image/png') {
		extension = '.png';
	} else if (mimetype === 'image/jpeg') {
		extension = '.jpeg';
	} else if (mimetype === 'image/jpg') {
		extension = '.jpg';
	} else {
		console.error('receiveImageStream: Only png, jpeg, or jpg are allowed.');
		return null;
	}

	return { stream: data.file, filename: sanitizedFilename, extension };
}

// Middle function to create new filename
function createProfileImageFilename(user_id: string, extension: string): string {
	return `img_profile_photo__user_id__${user_id}${extension}`;
}

// Saves the image stream to a folder and returns the saved path
async function saveImageToFolder(stream: NodeJS.ReadableStream, filename: string): Promise<string> {
	// Use the container's directory structure
	const uploadDir = join('/usr/src/app/uploads_profile_images');
	if (!existsSync(uploadDir)) {
		mkdirSync(uploadDir, { recursive: true });
	}
	const uploadPath = join(uploadDir, filename);
	const writeStream = createWriteStream(uploadPath);

	await new Promise<void>((resolve, reject) => {
		const onError = (err: Error) => {
			// ensure we close the write stream on error
			try { writeStream.destroy(); } catch (_) {}
			reject(err);
		};

		stream
			.on('error', onError)
			.pipe(writeStream)
			.on('finish', () => resolve())
			.on('error', onError);
	});

	return uploadPath;
}

// Handler function that receives and saves the image, returns result object
async function handlerUploadImage(request: FastifyRequest, user_id: string) {
	const imageData = await receiveImageStream(request);
	if (!imageData) {
		throw new Error("Failed to receive image stream");
	}

	const { stream, extension } = imageData;
	const newFilename = createProfileImageFilename(user_id, extension);
	const savedPath = await saveImageToFolder(stream, newFilename);
	// return both the absolute saved path and the actual filename for DB-relative path construction
	return { path: savedPath, filename: newFilename };
}

// Utility function to determine the MIME type based on the file extension
function getMimeTypeFromPath(filePath: string): string | null {
	const extension = extname(filePath).toLowerCase();
	switch (extension) {
		case '.png':
			return 'image/png';
		case '.jpeg':
		case '.jpg':
			return 'image/jpeg';
		default:
			console.error(`Unsupported file extension: ${extension}`);
			return null;
	}
}

//----------
//----------
//----------

function extractFilenameFromPath(file_path: string | null): string | null {
	if (file_path == null)
		return null;

	const pathStr = String(file_path).trim();																		// clean string before procesing.
	if (pathStr.length === 0) 
		return null;

	const normalized = pathStr.replace(/\\/g, '/');															// normalize slashes "\" to "/"
	const parts = normalized.split('/');
	const filename = parts.pop() ?? null;																				// pop() will return the last element (in these case the filename + extention) 
	if (!filename || filename.length === 0) 
		return null;
	return filename;
}

// Deletes an image file from the uploads_profile_images folder
function deleteImageFromFolder(filename: string): boolean {
	const uploadDir = join('/usr/src/app/uploads_profile_images');
	const filePath = join(uploadDir, filename);
	if (existsSync(filePath)) {
		try {
			unlinkSync(filePath);
			return true;
		} catch {
			return false;
		}
	}
	return false;
}

function isFileInFolder(filename: string): boolean {

	const uploadDir = join('/usr/src/app/uploads_profile_images');
	const filePath = join(uploadDir, filename);
	return existsSync(filePath);
}

function handlerEraseFilename (file_path: string | null): boolean {
	const filenameExtracted = extractFilenameFromPath(file_path);
	if (!filenameExtracted) return false;
	if (!isFileInFolder(filenameExtracted)) return false;
	return deleteImageFromFolder(filenameExtracted);
}

export const users_imgs_logic = {
	handlerUploadImage,
	handlerEraseFilename,
	getMimeTypeFromPath,
};

