import express from 'express';

import ReelController from '../../controllers/reel.controller';

import { upload } from '../../configs/multer';

const router = express.Router();
router.post('/newReel', upload.single('video'), ReelController.newReel);
router.get('/', ReelController.getReel);
router.get("/personal/:userId", ReelController.personalReels);
router.patch('/react/:reelId', ReelController.reactReel);
router.put('/editReel/:reelId', upload.single('video'), ReelController.editReel);
router.get("/detail/:reelId", ReelController.getReelDetail);
router.get("/comments/:reelId", ReelController.getComments);
router.get("/allReels", ReelController.getAllReels);
router.delete("/:reelId", ReelController.delete);
router.patch("/setComment/:reelId", ReelController.setComment)
router.patch("/setPublic/:reelId", ReelController.setPublic)

export default router;