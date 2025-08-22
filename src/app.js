import { authRouter, reportsRouter, userRouter } from './routes/dispatcher.js';
import { config } from './exports/exports.js'; 
import { iPgManager } from './instances/iPgManager.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwtComponent from './services/jwtComponent.js';


//console.log(cors_config)
const PORT = config.SERVER_PORT || 3000;
const isServerDeployed = config.SERVER_DEPLOYED_FLAG === 'true';
const url = isServerDeployed ? `https://backend-sst.onrender.com, on port ${PORT}.` : `http://localhost:${PORT}`;

console.log('Estoy con el servidor desplegado?', isServerDeployed);

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(config.cors_config))


app.get('/', (req, res) => {
    res.send(`<h1>Welcome to the API</h1>
    <p>Server is running on ${url}</p>`);
});

app.get('/__db_ping', async (req, res) => {
  try {
    const r = await iPgManager.execRawQuery({ query: 'SELECT 1 AS ok', params: [], timeoutMs: 2000, logLabel: '__db_ping' });
    res.json({ ok: r[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.use('/auth', authRouter)
app.use('/reports', reportsRouter)
app.use('/user', userRouter)

app.get('/tecnicos', async (req, res) => {
  try {
    const result = await iPgManager.execRawQuery({
      query: `SELECT p.ced_persona, CONCAT(nom_persona || ' ' || p.apell_persona ), nom_rol FROM persona p
              INNER JOIN usuario_rol ur ON p.ced_persona = ur.ced_persona
              INNER JOIN rol r ON ur.id_rol = r.id_rol
              WHERE r.id_rol = 3`,
      params: [],
              }); 
      res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/departamentos', async (req, res) => {
  try {
    const result = await iPgManager.execRawQuery({
      query: 'SELECT * FROM departamento',
      params: []
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});


app.get('/auth/me', async (req, res) => {
  try {
    const { access_token } = req.cookies;
    if (!access_token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = jwtComponent.verifyToken({ token: access_token , key: config.ACCESS_TOKEN_KEY });
    console.log('User data:', user);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});


app.post('/asignarTecnico', async (req, res)=>{
  try {
    const { id_reporte, ced_persona } = req.query;
    if (!id_reporte || !ced_persona) {
      return res.status(400).json({ error: 'Missing id_reporte or ced_persona' });
    }

    const result = await iPgManager.execRawQuery({
      query: `UPDATE reporte SET id_tecnico = $1 WHERE id_reporte = $2 RETURNING *`,
      params: [ced_persona, id_reporte]
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
})


app.get('/reportes', async (req, res)=>{
  try {
    const result = await iPgManager.execRawQuery({
      query: 'SELECT * FROM reporte',
      params: []
    })
    if (result.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
})

app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`Server listening on ${url}`);
})