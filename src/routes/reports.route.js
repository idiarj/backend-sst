// routes/reports.js
import { Router } from 'express';
import ReportsController from '../controllers/reportsController.js';
// import auth from '../middlewares/auth.js';

export const reportsRouter = Router();
// router.use(auth);

reportsRouter.post('/', ReportsController.createReportPOST);
reportsRouter.get('/', ReportsController.listGET);
reportsRouter.get('/export', ReportsController.exportZipGET);
reportsRouter.get('/:id/download', ReportsController.downloadOneGET);

