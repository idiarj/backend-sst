// controllers/reportsController.js
import ReportsModel from '../models/reportsModel.js';
import jwtComponent from '../services/jwtComponent.js';
import { config } from '../exports/exports.js';

function parseDateISO(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

class ReportsController {

  // POST /reports
  static async createReportPOST(req, res) {
    try {
      // Autenticación: toma el userId desde el token/sesión
      const userId = req.user?.id ?? null; // ajusta según tu auth
      const { asistencia, descripcion, instalacion, medio, respaldo, revision } = req.body;
      const data = jwtComponent.verifyToken({
        token: req.cookies.access_token,
        key: config.ACCESS_TOKEN_KEY
      });
      console.log('Data es:', data)

      // Validación básica
      if (!descripcion) {
        return res.status(400).json({ success: false, error: 'La descripción es obligatoria' });
      }
      
      const meta = await ReportsModel.createReport({
        asistencia, descripcion, instalacion, medio, respaldo, revision, userId: data.id_usuario, autor: data.nom_persona
      });

      return res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: meta
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports?from&to&limit&offset
  static async listGET(req, res) {
    try {
      const userId = req.user?.id ?? null;
      const { from, to, limit = 100, offset = 0 } = req.query;

      const dFrom = parseDateISO(from);
      const dTo = parseDateISO(to);
      if (!dFrom || !dTo || dFrom > dTo) {
        return res.status(400).json({ error: 'Parámetros de fecha inválidos' });
      }

      const rows = await ReportsModel.listByDateRange({
        userId, from: dFrom.toISOString(), to: dTo.toISOString(), limit: Number(limit), offset: Number(offset)
      });

      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /reports/:id/download
  static async downloadOneGET(req, res) {
    try {
      const userId = req.user?.id ?? null;
      const { id } = req.params;

      // Busca en DB
      const row = await ReportsModel.findById({ id, userId });
      if (!row) return res.status(404).json({ error: 'Not found' });

      await ReportsModel.streamSingleReport({
        res,
        relPath: row.file_path,
        downloadName: `reporte_${id}.pdf`
      });
    } catch (error) {
      console.error(error);
      // Evita doble send si ya se empezó el stream
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message });
      }
      res.end();
    }
  }

  // GET /reports/export?from&to&mode=zip
  static async exportZipGET(req, res) {
    try {
      const userId = req.user?.id ?? null;
      const { from, to, mode = 'zip' } = req.query;

      const dFrom = parseDateISO(from);
      const dTo = parseDateISO(to);
      if (!dFrom || !dTo || dFrom > dTo) {
        return res.status(400).json({ error: 'Parámetros de fecha inválidos' });
      }

      if (mode !== 'zip') {
        return res.status(400).json({ error: 'Modo inválido. Usa mode=zip' });
      }

      // Obtiene reportes del rango. Asegúrate de que listByDateRange retorne [{id, file_path}, ...]
      const files = await ReportsModel.listByDateRange({
        userId, from: dFrom.toISOString(), to: dTo.toISOString(), limit: 10_000, offset: 0
      });

      if (!files.length) {
        console.log('No files found for the specified date range');
        return res.status(204).end();
      }

      const fname = `reportes_${from}_${to}.zip`;
      await ReportsModel.streamZip({ res, files, filename: fname });
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message });
      }
      res.end();
    }
  }
}

export default ReportsController;
