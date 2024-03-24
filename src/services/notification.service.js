import Notification from "../models/notification";

class NotificationService {
  async create({ user, title, content, type, meta_data }) {
    const notification = new Notification({
      user,
      content,
      title,
      type,
      meta_data,
    });

    await notification.save();

    await notification.populate("user");
    await notification.populate("meta_data.sender");

    return notification;
  }

  async update(userId, data) {
    const { _id, ...dataUpdate } = data;
    await Notification.findOneAndUpdate({ user: userId, _id }, dataUpdate)
  }

  async getNotificationsOfUser({ userId }) {
    const notifications = await Notification.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("meta_data.sender")
      .exec();

    return notifications;
  }
}

export default new NotificationService();
