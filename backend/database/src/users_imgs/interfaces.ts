export interface UsersImg {
  user_id: number;
  image: Buffer;           // REMINDER: JPEG & PNG are binary. Bugger is for binary type of data transfer
  mimetypet: string;
}