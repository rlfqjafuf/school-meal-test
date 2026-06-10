import http from "node:http";

const PORT = Number(process.env.PORT || 10000);
const NEIS_BASE_URL = "https://open.neis.go.kr/hub";
const NEIS_API_KEY = process.env.NEIS_API_KEY || "";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const mealCodeByType = {
  lunch: "2",
  dinner: "3",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=300",
  });
  res.end(JSON.stringify(payload));
}

function sendOptions(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

function requireParam(url, name) {
  const value = url.searchParams.get(name)?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function fetchNeis(path, params) {
  const url = new URL(`${NEIS_BASE_URL}${path}`);
  url.searchParams.set("Type", "json");
  if (NEIS_API_KEY) {
    url.searchParams.set("KEY", NEIS_API_KEY);
  }
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(`NEIS request failed: ${response.status}`);
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function handleSchools(url, res) {
  const name = requireParam(url, "name");
  const data = await fetchNeis("/schoolInfo", {
    pIndex: "1",
    pSize: url.searchParams.get("limit") || "8",
    SCHUL_NM: name,
  });
  sendJson(res, 200, data);
}

async function handleMeal(url, res) {
  const officeCode = requireParam(url, "officeCode");
  const schoolCode = requireParam(url, "schoolCode");
  const date = requireParam(url, "date").replaceAll("-", "");
  const mealType = url.searchParams.get("mealType") || "lunch";
  const data = await fetchNeis("/mealServiceDietInfo", {
    ATPT_OFCDC_SC_CODE: officeCode,
    SD_SCHUL_CODE: schoolCode,
    MLSV_YMD: date,
    MMEAL_SC_CODE: mealCodeByType[mealType] || "2",
  });
  sendJson(res, 200, data);
}

async function handleMonthlyMeals(url, res) {
  const officeCode = requireParam(url, "officeCode");
  const schoolCode = requireParam(url, "schoolCode");
  const month = requireParam(url, "month");
  const mealType = url.searchParams.get("mealType") || "lunch";
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) {
    throw new Error("month must be YYYY-MM");
  }

  const start = `${year}${String(monthNumber).padStart(2, "0")}01`;
  const endDate = new Date(year, monthNumber, 0);
  const end = `${year}${String(monthNumber).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}`;
  const data = await fetchNeis("/mealServiceDietInfo", {
    pIndex: "1",
    pSize: "100",
    ATPT_OFCDC_SC_CODE: officeCode,
    SD_SCHUL_CODE: schoolCode,
    MLSV_FROM_YMD: start,
    MLSV_TO_YMD: end,
    MMEAL_SC_CODE: mealCodeByType[mealType] || "2",
  });
  sendJson(res, 200, data);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendOptions(res);
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  try {
    if (url.pathname === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    if (url.pathname === "/api/schools") {
      await handleSchools(url, res);
      return;
    }
    if (url.pathname === "/api/meal") {
      await handleMeal(url, res);
      return;
    }
    if (url.pathname === "/api/meals/month") {
      await handleMonthlyMeals(url, res);
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, error.statusCode || 400, {
      error: error.message || "Request failed",
      details: error.data,
    });
  }
});

server.listen(PORT, () => {
  console.log(`NEIS proxy listening on ${PORT}`);
});
