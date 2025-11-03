import { FastifyRequest, FastifyReply } from 'fastify';
import {users_img, users_model } from "../../users/v1/models"
import { users_imgs_logic } from './logic';
import { Database } from "sqlite";
import fs from 'fs'; 

export async function handlerUpdateProfileImg(
	request: FastifyRequest<{ Params: { user_id: string } }>,
	reply: FastifyReply,
	db: Database
) {
	try {
		const user_id = Number(request.params.user_id);

		if (!(await users_model.getUserById(db, user_id))) {
			reply.code(400).send({ error: "users_imgs: user not found"});
			return;
		}

		// Will check if there is an image in the users_path related to the user_id.
		const imgPath = await users_img.getUserProfileImagePathByUserId(db, user_id);
		if (imgPath) {
			// erase the existing file from disk (expects a path/filename)
			if (!users_imgs_logic.handlerEraseFilename(imgPath)) {
				reply.code(500).send({ error: "users_imgs: error while procesing data, please try again."});
				return;
			}
			await users_img.updateUserProfileImagePath(db, user_id, null as unknown as string);
		}

		// Handle image upload and save to disk
		const {filename} = await users_imgs_logic.handlerUploadImage(request, String(user_id));

		// Store relative path in DB (e.g., 'DB__API_DB/uploads_profile_images/filename')
		const relativePath = `/uploads_profile_images/${filename}`;
		await users_img.updateUserProfileImagePath(db, user_id, relativePath);

		reply.send({ msg: 'Profile image updated, image saved' });
	} catch (err) {
		console.error(err);
		reply.code(500).send({ error: "users_imgs: error while procesing data."});
	}
}

export async function handlerEraseProfileImg(
	request: FastifyRequest<{ Params: { user_id: string } }>,
	reply: FastifyReply,
	db: Database
) {
	try {
		const user_id = Number(request.params.user_id);

		if (!(await users_model.getUserById(db, user_id))) {
			reply.code(400).send({ error: "users_imgs: user not found"});
			return;
		}

		// Will check if there is an image in the users_path. 
		const imgPath = await users_img.getUserProfileImagePathByUserId(db, user_id);
		if (!imgPath) {
			reply.code(400).send({ error: "users_imgs: user does not have any image profile in the DB"});
			return;
		}

		if (!users_imgs_logic.handlerEraseFilename(imgPath)) { // erase the image in the folder
			reply.code(500).send({ error: "users_imgs: error while procesing data, please try again."});
			return;
		}
	
		await users_img.updateUserProfileImagePath(db, user_id, null as unknown as string);					// We update the profile_image path in the DB to "null"

		reply.code(200).send({ msg: 'Profile image updated'});
	} catch (err) {
		console.error(err);
		reply.code(500).send({ error: "users_imgs: error while procesing data."});
	}
}

export async function handlerGetProfileImg(
	request: FastifyRequest<{ Params: { user_id: string } }>,
	reply: FastifyReply,
	db: Database
) {
	try {
		const user_id = Number(request.params.user_id);

		if (!(await users_model.getUserById(db, user_id))) {
			reply.code(400).send({ error: "users_imgs: user not found" });
			return;
		}

		// Check if there is an image in the users_path.
		const imgPath = await users_img.getUserProfileImagePathByUserId(db, user_id);
		if (!imgPath) {
			reply.code(400).send({ error: "users_imgs: user does not have any image profile in the DB" });
			return;
		}

		// Adjust the path for the container environment
		const fullPath = `/usr/src/app${imgPath}`;

		// Check if the image exists in the folder
		if (!fs.existsSync(fullPath)) {
			reply.code(404).send({ error: "users_imgs: image file not found on the server" });
			return;
		}

		// Determine the MIME type based on the file extension
		const resMimeType = users_imgs_logic.getMimeTypeFromPath(imgPath);
		if (!resMimeType) {
			reply.code(400).send({ error: "users_imgs: unsupported file type please update profile image type to jpeg / png only" });
			return;
		}

		// Send the image with the correct Content-Type
		reply.header("Content-Type", resMimeType);
		const imageStream = fs.createReadStream(fullPath);
		return reply.code(200).send(imageStream);

	} catch (err) {
		console.error(err);
		reply.code(500).send({ error: "users_imgs: error while processing data." });
	}
}

export const users_img_handlers = {
	handlerUpdateProfileImg,
	handlerEraseProfileImg,
	handlerGetProfileImg
}
