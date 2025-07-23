import ReportsModel from "../models/reportsModel.js";


class ReportsController {


    static async createReportPOST(req, res){
        try {
            const {} = req.body

            await ReportsModel.createReport({
                
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    }
}


export default ReportsController;