import pdfkit from 'pdfkit';
import fs from 'fs';
import path from 'path';

class ReportsModel {
    static async createReport({title, name, description }){
        try {
            const doc = new pdfkit();







            return doc
        } catch (error) {
            throw new Error('Error creating report: ' + error.message);
        }
    }

    static async getReports(){
        try {
            
        } catch (error) {
            throw new Error('Error al obtener los reportes:', error.message)
        }
    }
}


export default ReportsModel;