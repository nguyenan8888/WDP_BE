import reportService from "../services/report.service";
import { ApiError } from "../helpers/errorHandle";

class ReportController {
    async newReport(req, res, next) {
        const { targetId } = req.params;
        const data = req.body;
        const userId = req.user.id;
        try {
            const report = await reportService.newReport(userId, targetId, data);
            res.status(200).json({
                message: "Report has been sent",
            });
        } catch (err) {
            next(new ApiError(400, err?.message));
        }
    }

    async allReport(req, res, next) {
        const { page, size, type, createdAt, totalReport, search } = req.query;
        try {
            const reports = await reportService.allReport(page, size, type, createdAt, totalReport, search);
            res.status(200).json({
                data: reports,
            });
        } catch (err) {
            next(new ApiError(400, err?.message));
        }
    }

    async reportDetail(req, res, next) {
        const { reportId } = req.params;
        try {
            const report = await reportService.reportDetail(reportId);
            res.status(200).json({
                data: report,
            });
        } catch (err) {
            next(new ApiError(400, err?.message));
        }
    }
}

export default new ReportController();