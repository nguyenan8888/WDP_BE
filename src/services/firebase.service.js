import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../configs/firebase";

class FirebaseService {
  /**
   *
   * @param {String} userId
   * @param {File[]} files
   * @returns {Promise<String[]>} // image url
   */
  async uploadToStorage(userId, files = []) {
    const datas = await Promise.all(
      files.map((file, index) => {
        let folder = `images/${userId}-${new Date().valueOf()}-${index}`;
        if (file.mimetype.includes("video")) {
          folder = `videos/${userId}-${new Date().valueOf()}-${index}`
        };
        const fileRef = ref(
          storage,
          folder
        );
        return uploadBytes(fileRef, file.buffer, {
          contentType: file?.mimetype || "image/jpeg" || "video/mp4",
        });
      })
    );

    const urls = await Promise.all(
      datas.map((data) => getDownloadURL(data.ref))
    );

    return urls;
  }
}
export default new FirebaseService();
