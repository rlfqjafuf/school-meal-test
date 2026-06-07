const loginScreen = document.querySelector("#loginScreen");
const dashboard = document.querySelector("#dashboard");
const profileForm = document.querySelector("#profileForm");
const guestButton = document.querySelector("#guestButton");
const profileSchool = document.querySelector("#profileSchool");
const profileGrade = document.querySelector("#profileGrade");
const profileClass = document.querySelector("#profileClass");
const profileNumber = document.querySelector("#profileNumber");
const profileName = document.querySelector("#profileName");
const welcomeText = document.querySelector("#welcomeText");
const logoutButton = document.querySelector("#logoutButton");
const mypageLogoutButton = document.querySelector("#mypageLogoutButton");
const attendanceCard = document.querySelector("#attendanceCard");
const attendanceCount = document.querySelector("#attendanceCount");
const profileSummary = document.querySelector("#profileSummary");
const profileSchoolName = document.querySelector("#profileSchoolName");
const profileAttendance = document.querySelector("#profileAttendance");
const profileMealType = document.querySelector("#profileMealType");
const settingsApiKeyInput = document.querySelector("#settingsApiKeyInput");
const saveApiKeyButton = document.querySelector("#saveApiKeyButton");
const testApiButton = document.querySelector("#testApiButton");
const apiStatusText = document.querySelector("#apiStatusText");
const showSearchButton = document.querySelector("#showSearchButton");
const searchPanel = document.querySelector("#searchPanel");
const apiKeyInput = document.querySelector("#apiKeyInput");
const schoolInput = document.querySelector("#schoolInput");
const searchButton = document.querySelector("#searchButton");
const schoolResults = document.querySelector("#schoolResults");
const selectedSchoolLabel = document.querySelector("#selectedSchoolLabel");
const dateInput = document.querySelector("#dateInput");
const dateTitle = document.querySelector("#dateTitle");
const weekStrip = document.querySelector("#weekStrip");
const prevDayButton = document.querySelector("#prevDayButton");
const nextDayButton = document.querySelector("#nextDayButton");
const monthInput = document.querySelector("#monthInput");
const monthTitle = document.querySelector("#monthTitle");
const loadMonthButton = document.querySelector("#loadMonthButton");
const sampleMonthButton = document.querySelector("#sampleMonthButton");
const monthlyMealList = document.querySelector("#monthlyMealList");
const mealTitle = document.querySelector("#mealTitle");
const mealCalorie = document.querySelector("#mealCalorie");
const mealCard = document.querySelector("#mealCard");
const allergyBox = document.querySelector("#allergyBox");
const loadMealButton = document.querySelector("#loadMealButton");
const sampleButton = document.querySelector("#sampleButton");
const mealTabs = document.querySelectorAll(".meal-tab");
const commentList = document.querySelector("#commentList");
const commentInput = document.querySelector("#commentInput");
const addCommentButton = document.querySelector("#addCommentButton");
const pagePanels = document.querySelectorAll(".page-panel");
const navButtons = document.querySelectorAll(".nav-button");

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const sampleSchool = {
  name: "테스트 학교",
  officeCode: "B10",
  schoolCode: "7010057",
};
const sampleMeals = {
  lunch: {
    menu: ["찰현미밥", "맑은미역국", "닭갈비", "감자채볶음", "배추김치", "요구르트"],
    calorie: "812.4 Kcal",
    allergens: ["우유", "계란", "대두", "밀"],
    origin: "예시 데이터",
  },
  dinner: {
    menu: ["김가루밥", "어묵국", "떡볶이", "순대", "단무지", "사과주스"],
    calorie: "765.1 Kcal",
    allergens: ["대두", "밀"],
    origin: "예시 데이터",
  },
};

let currentUser = JSON.parse(localStorage.getItem("schoolMealUser")) || null;
let currentSchool = JSON.parse(localStorage.getItem("meal-app-school")) || sampleSchool;
let selectedDate = new Date();
let selectedMonth = new Date();
let currentMealType = "lunch";
let currentMeals = sampleMeals;
let neisApiKey = localStorage.getItem("neisApiKey") || "";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatNeisDate(date) {
  return formatDate(date).replaceAll("-", "");
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toNeisDate(value) {
  return value.replaceAll("-", "");
}

function getMonthRange(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
}

function getWeekday(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return weekdays[date.getDay()];
}

function cleanMenuText(text) {
  return text
    .replaceAll("<br/>", "\n")
    .replaceAll("<br>", "\n")
    .split("\n")
    .map((item) => item.replace(/\([^)]*\)/g, "").trim())
    .filter(Boolean);
}

function setBusy(button, isBusy, text) {
  button.disabled = isBusy;
  button.textContent = isBusy ? "불러오는 중..." : text;
}

function getNeisApiKey() {
  return apiKeyInput.value.trim() || settingsApiKeyInput.value.trim() || neisApiKey;
}

function syncApiKeyInputs() {
  apiKeyInput.value = neisApiKey;
  settingsApiKeyInput.value = neisApiKey;
  renderApiStatus();
}

function renderApiStatus(message, type) {
  const hasKey = Boolean(neisApiKey);
  apiStatusText.textContent = message || (hasKey
    ? "저장된 API 키가 있습니다. 학교 검색과 급식 조회에 자동으로 사용됩니다."
    : "API 키가 없어도 샘플 데이터로 화면 테스트는 가능합니다.");
  apiStatusText.classList.toggle("success", type === "success" || (hasKey && !type));
  apiStatusText.classList.toggle("error", type === "error");
}

function openDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  renderUser();
  renderSelectedSchool();
  renderDate();
  renderMonthHeader();
  renderSampleMonth();
  renderMeal();
  renderComments();
  syncApiKeyInputs();
  showPage("home");
}

function openLogin() {
  loginScreen.hidden = false;
  dashboard.hidden = true;
}

function saveUser(user) {
  currentUser = user;
  localStorage.setItem("schoolMealUser", JSON.stringify(user));
  markAttendance();
  openDashboard();
}

function renderUser() {
  const isGuest = !currentUser || currentUser.isGuest;
  if (isGuest) {
    welcomeText.textContent = "게스트로 급식만 확인 중";
    attendanceCard.hidden = true;
    profileSummary.textContent = "게스트";
    profileAttendance.textContent = "0일";
    profileMealType.textContent = currentMealType === "lunch" ? "점심" : "저녁";
    return;
  }

  welcomeText.textContent = `${currentUser.name}님, ${currentUser.grade}학년 ${currentUser.class}반`;
  attendanceCard.hidden = false;
  attendanceCount.textContent = `${getAttendanceDays().length || 1}일`;
  profileSummary.textContent = `${currentUser.name} · ${currentUser.grade}학년 ${currentUser.class}반 ${currentUser.number}번`;
  profileAttendance.textContent = `${getAttendanceDays().length || 1}일`;
  profileMealType.textContent = currentMealType === "lunch" ? "점심" : "저녁";
}

function getAttendanceDays() {
  return JSON.parse(localStorage.getItem("attendanceDays")) || [];
}

function markAttendance() {
  const today = formatDate(new Date());
  const days = getAttendanceDays();
  if (!days.includes(today)) {
    days.push(today);
    localStorage.setItem("attendanceDays", JSON.stringify(days));
  }
}

function renderSelectedSchool() {
  selectedSchoolLabel.textContent = currentSchool.name;
  profileSchoolName.textContent = currentSchool.name;
  if (currentUser && !currentUser.isGuest && currentUser.school) {
    profileSchool.value = currentUser.school;
  }
}

function showPage(pageName) {
  pagePanels.forEach((panel) => {
    panel.classList.toggle("active-page", panel.dataset.page === pageName);
  });
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.targetPage === pageName);
  });
  if (pageName === "mypage") {
    renderUser();
    renderSelectedSchool();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderDate() {
  const value = formatDate(selectedDate);
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  dateInput.value = value;
  dateTitle.textContent = `${month}월 ${day}일 (${weekdays[selectedDate.getDay()]})`;
  mealTitle.textContent = `${month}월 ${day}일 급식`;
  renderWeekStrip();
  renderComments();
}

function renderMonthHeader() {
  const value = formatMonth(selectedMonth);
  const month = selectedMonth.getMonth() + 1;
  monthInput.value = value;
  monthTitle.textContent = `${selectedMonth.getFullYear()}년 ${month}월 급식`;
}

function renderWeekStrip() {
  const dayIndex = selectedDate.getDay();
  const start = addDays(selectedDate, -dayIndex);
  weekStrip.innerHTML = "";

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(start, index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-button ${formatDate(date) === formatDate(selectedDate) ? "active" : ""}`;
    button.innerHTML = `<span>${weekdays[date.getDay()]}</span><strong>${date.getDate()}</strong>`;
    button.addEventListener("click", () => {
      selectedDate = date;
      renderDate();
    });
    weekStrip.appendChild(button);
  }
}

function renderMeal() {
  const meal = currentMeals[currentMealType] || sampleMeals[currentMealType];
  mealCalorie.textContent = meal.calorie || "칼로리 정보 없음";
  mealCard.innerHTML = meal.menu.map((item) => `<div class="meal-item">${item}</div>`).join("");
  allergyBox.hidden = !meal.allergens?.length;
  allergyBox.querySelector("p").textContent = meal.allergens?.join(", ") || "";
}

function renderNotice(message) {
  mealCalorie.textContent = "-";
  mealCard.innerHTML = `<p class="notice">${message}</p>`;
  allergyBox.hidden = true;
}

function renderMonthlyNotice(message) {
  monthlyMealList.innerHTML = `<p class="notice">${message}</p>`;
}

function normalizeMonthlyMealRows(rows) {
  return rows
    .map((row) => ({
      date: row.MLSV_YMD || "",
      mealName: row.MMEAL_SC_NM || "급식",
      menu: cleanMenuText(row.DDISH_NM || ""),
      calorie: row.CAL_INFO || "",
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderMonthlyMeals(meals) {
  if (!meals.length) {
    renderMonthlyNotice("선택한 달의 급식 정보가 없어요.");
    return;
  }

  monthlyMealList.innerHTML = meals
    .map((meal) => {
      const day = Number(meal.date.slice(6, 8));
      const dateText = `${meal.date.slice(0, 4)}-${meal.date.slice(4, 6)}-${meal.date.slice(6, 8)}`;
      const menu = meal.menu.slice(0, 6).join(", ");
      return `
        <article class="monthly-meal-item">
          <div class="monthly-date">
            <span>${getWeekday(dateText)}</span>
            <strong>${day}</strong>
          </div>
          <div class="monthly-menu">
            <strong>${meal.mealName}${meal.calorie ? ` · ${meal.calorie}` : ""}</strong>
            <p>${menu || "메뉴 정보 없음"}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSampleMonth() {
  const { start, end } = getMonthRange(formatMonth(selectedMonth));
  const meals = [];

  for (let day = new Date(start); day <= end; day = addDays(day, 1)) {
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const sample = day.getDate() % 2 === 0 ? sampleMeals.dinner : sampleMeals.lunch;
    meals.push({
      date: formatNeisDate(day),
      mealName: "점심",
      menu: sample.menu,
      calorie: sample.calorie,
    });
  }

  renderMonthlyMeals(meals);
}

function saveSchool(school) {
  currentSchool = school;
  localStorage.setItem("meal-app-school", JSON.stringify(currentSchool));
  renderSelectedSchool();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`요청 실패: ${response.status}`);
  }
  return response.json();
}

async function searchSchools() {
  const query = schoolInput.value.trim();
  if (!query) {
    schoolResults.innerHTML = `<p class="notice">학교 이름을 입력해주세요.</p>`;
    return;
  }

  const key = getNeisApiKey();
  const params = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: "8",
    SCHUL_NM: query,
  });
  if (key) params.set("KEY", key);

  setBusy(searchButton, true, "검색");
  schoolResults.innerHTML = "";

  try {
    const data = await fetchJson(`https://open.neis.go.kr/hub/schoolInfo?${params}`);
    const rows = data.schoolInfo?.[1]?.row || [];

    if (!rows.length) {
      schoolResults.innerHTML = `<p class="notice">검색 결과가 없어요. API 키가 없다면 예시 데이터로 먼저 테스트해보세요.</p>`;
      return;
    }

    schoolResults.innerHTML = rows
      .map(
        (school, index) => `
          <button class="school-button" type="button" data-index="${index}">
            <strong>${school.SCHUL_NM}</strong><br />
            <span>${school.ORG_RDNMA || school.LCTN_SC_NM || "주소 정보 없음"}</span>
          </button>
        `,
      )
      .join("");

    schoolResults.querySelectorAll(".school-button").forEach((button) => {
      button.addEventListener("click", () => {
        const school = rows[Number(button.dataset.index)];
        saveSchool({
          name: school.SCHUL_NM,
          officeCode: school.ATPT_OFCDC_SC_CODE,
          schoolCode: school.SD_SCHUL_CODE,
        });
        schoolResults.innerHTML = `<p class="notice">${school.SCHUL_NM} 선택 완료. 급식을 불러와보세요.</p>`;
      });
    });
  } catch (error) {
    schoolResults.innerHTML = `<p class="notice">학교 검색에 실패했어요. API 키나 네트워크 상태를 확인해주세요.</p>`;
    console.error(error);
  } finally {
    setBusy(searchButton, false, "검색");
  }
}

async function loadMeal() {
  const key = getNeisApiKey();
  const params = new URLSearchParams({
    Type: "json",
    ATPT_OFCDC_SC_CODE: currentSchool.officeCode,
    SD_SCHUL_CODE: currentSchool.schoolCode,
    MLSV_YMD: toNeisDate(dateInput.value),
    MMEAL_SC_CODE: currentMealType === "lunch" ? "2" : "3",
  });
  if (key) params.set("KEY", key);

  setBusy(loadMealButton, true, "급식 불러오기");

  try {
    const data = await fetchJson(`https://open.neis.go.kr/hub/mealServiceDietInfo?${params}`);
    const meal = data.mealServiceDietInfo?.[1]?.row?.[0];

    if (!meal) {
      renderNotice("해당 날짜의 급식 정보가 없어요. 방학, 주말, 재량휴업일일 수 있습니다.");
      return;
    }

    currentMeals = {
      ...currentMeals,
      [currentMealType]: {
        menu: cleanMenuText(meal.DDISH_NM),
        calorie: meal.CAL_INFO,
        allergens: (meal.DDISH_NM.match(/\(([^)]*)\)/g) || []).slice(0, 4),
        origin: `${currentSchool.name} 공식 급식 데이터`,
      },
    };
    renderMeal();
  } catch (error) {
    renderNotice("급식 조회에 실패했어요. API 키가 없거나 브라우저 보안 정책 때문에 막힐 수 있습니다.");
    console.error(error);
  } finally {
    setBusy(loadMealButton, false, "급식 불러오기");
  }
}

async function loadMonthMeals() {
  const key = getNeisApiKey();
  const { start, end } = getMonthRange(monthInput.value);
  const params = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: "100",
    ATPT_OFCDC_SC_CODE: currentSchool.officeCode,
    SD_SCHUL_CODE: currentSchool.schoolCode,
    MLSV_FROM_YMD: formatNeisDate(start),
    MLSV_TO_YMD: formatNeisDate(end),
    MMEAL_SC_CODE: currentMealType === "lunch" ? "2" : "3",
  });
  if (key) params.set("KEY", key);

  setBusy(loadMonthButton, true, "한 달 급식 불러오기");

  try {
    const data = await fetchJson(`https://open.neis.go.kr/hub/mealServiceDietInfo?${params}`);
    const rows = data.mealServiceDietInfo?.[1]?.row || [];
    renderMonthlyMeals(normalizeMonthlyMealRows(rows));
  } catch (error) {
    renderMonthlyNotice("월간 급식 조회에 실패했어요. API 키나 학교 선택을 확인해주세요.");
    console.error(error);
  } finally {
    setBusy(loadMonthButton, false, "한 달 급식 불러오기");
  }
}

async function testNeisApi() {
  const key = getNeisApiKey();
  const params = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: "1",
    SCHUL_NM: "서울",
  });
  if (key) params.set("KEY", key);

  setBusy(testApiButton, true, "연동 테스트");
  renderApiStatus("나이스 API 연결을 확인하는 중입니다...");

  try {
    const data = await fetchJson(`https://open.neis.go.kr/hub/schoolInfo?${params}`);
    const rows = data.schoolInfo?.[1]?.row || [];
    if (rows.length) {
      renderApiStatus("나이스 API 연동이 정상입니다.", "success");
      return;
    }
    renderApiStatus("응답은 받았지만 검색 결과가 없습니다. API 키를 확인해주세요.", "error");
  } catch (error) {
    renderApiStatus("나이스 API 연동 테스트에 실패했습니다. 키 또는 네트워크 상태를 확인해주세요.", "error");
    console.error(error);
  } finally {
    setBusy(testApiButton, false, "연동 테스트");
  }
}

function commentsKey() {
  return `mealComments:${formatDate(selectedDate)}`;
}

function getComments() {
  return JSON.parse(localStorage.getItem(commentsKey())) || [];
}

function renderComments() {
  const comments = getComments();
  if (!comments.length) {
    commentList.innerHTML = `<p class="notice">첫 의견을 남겨보세요.</p>`;
    return;
  }

  commentList.innerHTML = comments
    .map(
      (comment) => `
        <div class="comment">
          <p>${comment.text}</p>
          <span>${comment.author}</span>
        </div>
      `,
    )
    .join("");
}

function addComment() {
  const text = commentInput.value.trim();
  if (!text) return;

  const comments = getComments();
  comments.push({
    text,
    author: currentUser?.isGuest ? "게스트" : currentUser?.name || "사용자",
  });
  localStorage.setItem(commentsKey(), JSON.stringify(comments));
  commentInput.value = "";
  renderComments();
}

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveUser({
    school: profileSchool.value.trim(),
    grade: profileGrade.value,
    class: profileClass.value,
    number: profileNumber.value,
    name: profileName.value.trim(),
    isGuest: false,
  });
  if (profileSchool.value.trim()) {
    saveSchool({ ...sampleSchool, name: profileSchool.value.trim() });
  }
});

guestButton.addEventListener("click", () => {
  saveUser({ name: "게스트", school: "", grade: "", class: "", number: "", isGuest: true });
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("schoolMealUser");
  openLogin();
});

mypageLogoutButton.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("schoolMealUser");
  openLogin();
});

showSearchButton.addEventListener("click", () => {
  searchPanel.hidden = !searchPanel.hidden;
});

saveApiKeyButton.addEventListener("click", () => {
  neisApiKey = settingsApiKeyInput.value.trim();
  localStorage.setItem("neisApiKey", neisApiKey);
  syncApiKeyInputs();
  renderApiStatus(neisApiKey ? "API 키를 저장했습니다." : "저장된 API 키를 비웠습니다.", neisApiKey ? "success" : undefined);
});

testApiButton.addEventListener("click", testNeisApi);

apiKeyInput.addEventListener("change", () => {
  neisApiKey = apiKeyInput.value.trim();
  localStorage.setItem("neisApiKey", neisApiKey);
  syncApiKeyInputs();
});

searchButton.addEventListener("click", searchSchools);
loadMealButton.addEventListener("click", loadMeal);
loadMonthButton.addEventListener("click", loadMonthMeals);
sampleButton.addEventListener("click", () => {
  currentMeals = sampleMeals;
  renderMeal();
});
sampleMonthButton.addEventListener("click", renderSampleMonth);
schoolInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchSchools();
});

mealTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentMealType = tab.dataset.mealType;
    mealTabs.forEach((button) => button.classList.toggle("active", button === tab));
    renderMeal();
    renderUser();
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.targetPage);
  });
});

prevDayButton.addEventListener("click", () => {
  selectedDate = addDays(selectedDate, -1);
  renderDate();
});

nextDayButton.addEventListener("click", () => {
  selectedDate = addDays(selectedDate, 1);
  renderDate();
});

dateInput.addEventListener("change", () => {
  selectedDate = new Date(`${dateInput.value}T00:00:00`);
  selectedMonth = new Date(selectedDate);
  renderDate();
  renderMonthHeader();
});

monthInput.addEventListener("change", () => {
  selectedMonth = new Date(`${monthInput.value}-01T00:00:00`);
  renderMonthHeader();
  renderSampleMonth();
});

addCommentButton.addEventListener("click", addComment);
commentInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addComment();
});

if (currentUser) {
  openDashboard();
} else {
  openLogin();
}
