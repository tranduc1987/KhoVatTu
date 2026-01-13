import express from 'express';

const router = express.Router();

const {
  EXTERNAL_API_BASE_URL,
  EXTERNAL_API_ACCOUNT,
  EXTERNAL_API_PASSWORD,
} = process.env;

const buildUrl = (path) => {
  const base = (EXTERNAL_API_BASE_URL || '').replace(/\/$/, '');
  if (!base) {
    throw new Error('EXTERNAL_API_BASE_URL is not configured');
  }
  return `${base}${path}`;
};

const login = async () => {
  if (!EXTERNAL_API_ACCOUNT || !EXTERNAL_API_PASSWORD) {
    throw new Error('EXTERNAL_API_ACCOUNT or EXTERNAL_API_PASSWORD is missing');
  }

  const loginUrl = buildUrl(
    `/StandardApiAction_login.action?account=${encodeURIComponent(EXTERNAL_API_ACCOUNT)}&password=${encodeURIComponent(
      EXTERNAL_API_PASSWORD
    )}`
  );

  const response = await fetch(loginUrl);
  if (!response.ok) {
    throw new Error(`External login failed with status ${response.status}`);
  }
  const data = await response.json();
  if (data.result !== 0 || !data.jsession) {
    throw new Error('External login did not return a valid session');
  }
  return data.jsession;
};

const callExternalApi = async (endpoint, jsession) => {
  const url = buildUrl(`${endpoint}${endpoint.includes('?') ? '&' : '?'}jsession=${encodeURIComponent(jsession)}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`External API request failed with status ${response.status}`);
  }
  const data = await response.json();
  if (data.result !== 0) {
    throw new Error('External API returned an error');
  }
  return data;
};

router.get('/devices-sims', async (req, res) => {
  try {
    const jsession = await login();

    const [vehiclesRes, simsRes] = await Promise.all([
      callExternalApi('/StandardApiAction_queryUserVehicle.action?language=en', jsession),
      callExternalApi('/StandardApiAction_loadSIMInfos.action?currentPage=1&pageRecords=1000', jsession),
    ]);

    res.json({
      jsession,
      vehicles: vehiclesRes.vehicles || [],
      companies: vehiclesRes.companys || [],
      sims: simsRes.infos || [],
    });
  } catch (error) {
    console.error('Integration error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch devices and SIMs' });
  }
});

export default router;
