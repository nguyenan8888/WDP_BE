import { ApiError } from "../helpers/errorHandle";
import notificationService from "../services/notification.service";
import { response } from "../utils/baseResponse";

class NotificationController {
  async getNotificationsOfUser(req, res, next) {
    const userId = req.user.id;

    try {
      const notifications = await notificationService.getNotificationsOfUser({
        userId,
      });

      return res.status(200).json(
        response.success({
          data: { notifications },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async update(req, res, next) {
    const userId = req.user.id;
    const data = req.body;

    try {
      await notificationService.update(userId, data);

      return res.status(200).json(response.success({}));
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }
}

export default new NotificationController();
