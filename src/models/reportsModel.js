// models/reportsModel.js
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import archiver from 'archiver';
import crypto from 'crypto';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { iPgManager } from '../instances/iPgManager.js';
// IMPORTANTE: reemplaza por tu capa de DB
// import db from '../db/index.js'; // pg-promise/knex/pg client, etc.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_ROOT = path.resolve(process.cwd(), 'reports');
const pump = promisify(pipeline);

function ensureUnderRoot(absPath) {
  const root = REPORTS_ROOT.endsWith(path.sep) ? REPORTS_ROOT : REPORTS_ROOT + path.sep;
  if (!absPath.startsWith(root)) {
    throw new Error('Path traversal attempt detected');
  }
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

function safeFilename(name) {
  return name.replace(/[^\w.-]+/g, '_');
}

function todayFolderParts() {
  const now = new Date();
  const YYYY = String(now.getFullYear());
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  return { YYYY, MM, DD };
}

async function writeBufferToFile(absPath, buffer) {
  await ensureDir(path.dirname(absPath));
  await fsp.writeFile(absPath, buffer);
  const stats = await fsp.stat(absPath);
  return { size: stats.size };
}

function contentDispositionAttachment(filename) {
  const ascii = safeFilename(filename);
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

async function pdfFromHtml(html) {
  // NOTA: en producción considera un pool de browser para alto rendimiento
  const browser = await puppeteer.launch({
    // headless: 'new' // según versión
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '16mm', left: '12mm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function renderReportHTML({ asistencia, descripcion, instalacion, medio, respaldo, revision, autor, departamento }) {
  // OJO: si los campos vienen de usuario, considera sanitizar/escapar HTML
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte de Asistencia Técnica</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f7f9fa; margin:0; padding:0; }
  .report-container { background:#fff; max-width:900px; margin:30px auto; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); padding:32px 40px; }
  .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .header-title { font-size:2rem; font-weight:600; color:#222; display:flex; align-items:center; }
  .header-title i { margin-right:10px; }
  .date { font-size:1rem; color:#888; }
  .section { margin-bottom:18px; }
  .section-title { font-size:1.1rem; font-weight:500; color:#336699; margin-bottom:8px; }
  .fields { display:flex; flex-wrap:wrap; gap:16px; }
  .field { background:#f2f6fa; border-radius:8px; padding:10px 18px; min-width:180px; font-size:1rem; color:#333; margin-bottom:8px; }
  .observaciones { background:#f2f6fa; border-radius:8px; padding:14px 18px; font-size:1rem; color:#333; min-height:80px; white-space:pre-wrap; }
  .label { font-weight:600; color:#222; }
</style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div class="header-title"><i>📝</i> REPORTE DE ASISTENCIA TÉCNICA</div>
      <div class="date">${new Date().toLocaleDateString('es-ES')}</div>
    </div>
    <div class="section">
      <div class="fields">
        <div class="field"><span class="label">Asistencia Técnica:</span> ${asistencia ?? '-'}</div>
        <div class="field"><span class="label">Instalación:</span> ${instalacion ?? '-'}</div>
        <div class="field"><span class="label">Medio:</span> ${medio ?? '-'}</div>
        <div class="field"><span class="label">Respaldo:</span> ${respaldo ?? '-'}</div>
        <div class="field"><span class="label">Revisión:</span> ${revision ?? '-'}</div>
        <div class="field"><span class="label">Autor:</span> ${autor ?? '-'}</div>
        <div class="field"><span class="label">Departamento:</span> ${departamento ?? '-'}</div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Observaciones</div>
      <div class="observaciones">${descripcion ?? '-'}</div>
    </div>
  </div>
</body>
</html>`;
}

class ReportsModel {

  static get rootDir() {
    return REPORTS_ROOT;
  }

  /**
   * Crea un reporte, guarda PDF en disco y registra metadatos en DB.
   * @returns {Promise<{id:string, file_path:string, file_size:number}>}
   */
  static async createReport({
  asistencia, descripcion, instalacion, medio, respaldo, revision,
  userId, autor = 'Cosito', departamento = 'Cositomovil'
}) {
  let id_reporte;
  console.log('user id equisde',userId)

  try {
    // 1) Insertar para obtener el ID (ajusta columnas a tu esquema real)
    const insertQuery = `
      INSERT INTO reporte (
        id_usuario, des_reporte, ruta_reporte, asistencia_tecnica,
        tipo_mantenimiento_revision, programas_instalar, copia_seguridad,
        medio_fisico, file_size
      ) VALUES (
        $1,$2,NULL,$3,$4,$5,$6,$7,NULL
      ) RETURNING id_reporte, created_at
    `;
    const paramsInsert = [
      userId, descripcion, asistencia, revision, instalacion,
      respaldo, medio
    ];
    const [{ id_reporte, created_at }] = await iPgManager.execRawQuery({
      query: insertQuery,
      params: paramsInsert
    });

    // 2) Construir path con el ID recién creado
    const { YYYY, MM, DD } = todayFolderParts(); // o usa created_at para la carpeta
    const relDir  = path.join(YYYY, MM, DD);
    const relPath = path.join(relDir, `report_${id_reporte}.pdf`);
    const absPath = path.resolve(REPORTS_ROOT, relPath);
    ensureUnderRoot(absPath);

    // 3) Generar y guardar PDF
    const html = renderReportHTML({ asistencia, descripcion, instalacion, medio, respaldo, revision, autor, departamento });
    const pdfBuffer = await pdfFromHtml(html);
    await ensureDir(path.dirname(absPath));
    await fs.promises.writeFile(absPath, pdfBuffer);
    const { size } = await fs.promises.stat(absPath);

    // 4) Actualizar ruta y tamaño
    await iPgManager.execRawQuery({
      query: `UPDATE reporte SET ruta_reporte = $1, file_size = $2 WHERE id_reporte = $3`,
      params: [relPath, size, id_reporte]
    });

    return { id: id_reporte, file_path: relPath, file_size: size };
  } catch (err) {
    // Limpieza si falló después del insert
    if (id_reporte) {
      await iPgManager.execRawQuery({
        query: `DELETE FROM reporte WHERE id_reporte = $1`,
        params: [id_reporte]
      }).catch(() => {});
    }
    throw err;
  }
    }


  /**
   * Lista reportes por rango de fechas (inclusive from, exclusivo to+1d si lo deseas).
   */
static async listByDateRange({
    userId,
    from,
    to,
    limit = 100,
    offset = 0
  }) {
    const query = `
      SELECT
        id_reporte       AS id,
        ruta_reporte     AS file_path,
        file_size,
        created_at,
        des_reporte,
        asistencia_tecnica,
        tipo_mantenimiento_revision,
        programas_instalar,
        copia_seguridad,
        medio_fisico
      FROM public.reporte
      WHERE id_usuario = $1
        AND created_at >= $2
        AND created_at <  $3
      ORDER BY created_at ASC
      LIMIT $4 OFFSET $5
    `;
    const params = [1, from, to, limit, offset];

    const rows = await iPgManager.execRawQuery({ query, params });
    // rows ya es un array de objetos; devuelve tal cual
    return rows;
  }

  /**
   * Obtiene metadatos de un reporte por id + pertenencia al usuario.
   */
  static async findById({ id, userId }) {
    const query = `
      SELECT
        id_reporte   AS id,
        ruta_reporte AS file_path,
        file_size,
        created_at,
        des_reporte
      FROM public.reporte
      WHERE id_reporte = $1
        AND id_usuario = $2
      LIMIT 1
    `;
    const params = [id, userId];
    const rows = await iPgManager.execRawQuery({ query, params });
    return rows[0] ?? null;
  }

  /**
   * Stream de un archivo PDF individual al response.
   */
  static async streamSingleReport({
    res,
    relPath,
    downloadName = 'reporte.pdf'
  }) {
    // Normaliza y asegura que está dentro del root
    const absPath = path.resolve(REPORTS_ROOT, relPath);
    ensureUnderRoot(absPath);

    if (!fs.existsSync(absPath)) {
      res.status(410).json({ error: 'missing', message: 'El archivo no existe en el servidor' });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', contentDispositionAttachment(downloadName));

    const rs = fs.createReadStream(absPath);
    await pipeline(rs, res);
  }

  /**
   * Crea y envía un ZIP con múltiples reportes (streaming).
   * @param files Array<{id?: number, file_path: string}>
   */
  static async streamZip({
    res,
    files,
    filename = 'reportes.zip'
  }) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', contentDispositionAttachment(filename));

    const archive = archiver('zip', { zlib: { level: 9 } });

    // Manejo de errores del zip
    archive.on('error', (err) => {
      try {
        if (!res.headersSent) {
          res.status(500);
        }
        res.end();
      } catch {}
    });

    archive.pipe(res);

    for (const f of files) {
      const abs = path.resolve(REPORTS_ROOT, f.file_path);
      try {
        ensureUnderRoot(abs);
        if (fs.existsSync(abs)) {
          const base = path.basename(abs);
          const baseNoExt = base.replace(/\.pdf$/i, '');
          const nameInZip = safeFilename(`reporte_${f.id ?? baseNoExt}.pdf`);
          archive.file(abs, { name: nameInZip });
        } else {
          const missingName = safeFilename(`missing_${f.id ?? crypto.randomUUID()}.txt`);
          archive.append(`Archivo faltante: ${f.file_path}\n`, { name: missingName });
        }
      } catch (e) {
        const errName = safeFilename(`error_${f.id ?? crypto.randomUUID()}.txt`);
        archive.append(`Error con archivo: ${f.file_path} -> ${e.message}\n`, { name: errName });
      }
    }

    await archive.finalize();
  }
}

export default ReportsModel;
