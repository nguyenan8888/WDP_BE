import { ApiError } from "../helpers/errorHandle";
import { response } from "../utils/baseResponse";
import activityService from "../services/activity.service";

class ActivityController {
    async getUserActivity(req, res, next) {
        const userId = req.user.id;
        const { type, contentType } = req.query;
        try {
            const activity = await activityService.getUserActivity(userId, type, contentType);
            return res.status(200).json(
                response.success({
                    data: { activity },
                })
            );
        } catch (err) {
            next(new ApiError(400, err?.message));
        }
    }

    async deleteUserActivity(req, res, next) {
        const { activityId } = req.params;
        try {
            await activityService.deleteActivityBy(activityId);
            return res.status(200).json(
                response.success({
                    message: "Activity has been deleted",
                })
            );
        } catch (err) {
            next(new ApiError(400, err?.message));
        }
    }
}

export default new ActivityController();
