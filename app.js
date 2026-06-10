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
const showSearchButton = document.querySelector("#showSearchButton");
const searchPanel = document.querySelector("#searchPanel");
const schoolInput = document.querySelector("#schoolInput");
const searchButton = document.querySelector("#searchButton");
const schoolResults = document.querySelector("#schoolResults");
const selectedSchoolLabel = document.querySelector("#selectedSchoolLabel");
const dateInput = document.querySelector("#dateInput");
const monthInput = document.querySelector("#monthInput");
const monthTitle = document.querySelector("#monthTitle");
const loadMonthButton = document.querySelector("#loadMonthButton");
const monthCalendar = document.querySelector("#monthCalendar");
const monthlyMealList = document.querySelector("#monthlyMealList");
const calendarDetailModal = document.querySelector("#calendarDetailModal");
const closeCalendarDetailButton = document.querySelector("#closeCalendarDetailButton");
const calendarDetailWeekday = document.querySelector("#calendarDetailWeekday");
const calendarDetailDay = document.querySelector("#calendarDetailDay");
const calendarDetailSchool = document.querySelector("#calendarDetailSchool");
const calendarDetailTitle = document.querySelector("#calendarDetailTitle");
const calendarDetailCalorie = document.querySelector("#calendarDetailCalorie");
const calendarDetailMenu = document.querySelector("#calendarDetailMenu");
const calendarDetailUseButton = document.querySelector("#calendarDetailUseButton");
const mealTitle = document.querySelector("#mealTitle");
const mealCalorie = document.querySelector("#mealCalorie");
const mealCard = document.querySelector("#mealCard");
const allergyBox = document.querySelector("#allergyBox");
const loadMealButton = document.querySelector("#loadMealButton");
const mealTabs = document.querySelectorAll(".meal-tab");
const commentList = document.querySelector("#commentList");
const commentInput = document.querySelector("#commentInput");
const addCommentButton = document.querySelector("#addCommentButton");
const pagePanels = document.querySelectorAll(".page-panel");
const navButtons = document.querySelectorAll(".nav-button");

const NEIS_PROXY_BASE_URL = "https://school-meal-neis-proxy.onrender.com";
const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

let currentUser = JSON.parse(localStorage.getItem("schoolMealUser")) || null;
let currentSchool = JSON.parse(localStorage.getItem("meal-app-school")) || null;
let selectedDate = new Date();
let selectedMonth = new Date();
let currentMealType = "lunch";
let currentMeals = {
  lunch: null,
  dinner: null,
};
let monthlyMeals = [];
let detailDate = null;

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

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
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

function toNeisDate(dateText) {
  return dateText.replaceAll("-", "");
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

function openDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  renderUser();
  renderSelectedSchool();
  renderDate();
  renderMonthHeader();
  renderMeal();
  monthlyMeals = [];
  renderMonthCalendar();
  renderMonthlyNotice("학교를 선택한 뒤 한 달 급식 불러오기를 눌러주세요.");
  renderComments();
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
  const schoolName = currentSchool?.name || "선택된 학교 없음";
  selectedSchoolLabel.textContent = schoolName;
  profileSchoolName.textContent = schoolName;
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
  mealTitle.textContent = `${month}월 ${day}일 급식`;
  renderComments();
}

function renderMonthHeader() {
  const value = formatMonth(selectedMonth);
  const month = selectedMonth.getMonth() + 1;
  monthInput.value = value;
  monthTitle.textContent = `${selectedMonth.getFullYear()}년 ${month}월 급식`;
}

function renderMeal() {
  const meal = currentMeals[currentMealType];
  if (!currentSchool) {
    renderNotice("먼저 학교 검색에서 학교를 선택해주세요.");
    return;
  }
  if (!meal) {
    renderNotice("나이스 API에서 급식 정보를 불러오려면 급식 불러오기를 눌러주세요.");
    return;
  }
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

function getMealForDate(dateText) {
  const neisDate = toNeisDate(dateText);
  return monthlyMeals.find((meal) => meal.date === neisDate);
}

function closeCalendarDetail() {
  calendarDetailModal.hidden = true;
  detailDate = null;
}

function openCalendarDetail(dateText) {
  detailDate = dateText;
  const date = new Date(`${dateText}T00:00:00`);
  const meal = getMealForDate(dateText);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  calendarDetailWeekday.textContent = weekdays[date.getDay()];
  calendarDetailDay.textContent = String(day);
  calendarDetailSchool.textContent = currentSchool?.name || "선택된 학교 없음";
  calendarDetailTitle.textContent = `${month}월 ${day}일 ${currentMealType === "lunch" ? "점심" : "저녁"} 급식`;
  calendarDetailCalorie.textContent = meal?.calorie || "칼로리 정보 없음";

  if (meal?.menu?.length) {
    calendarDetailMenu.replaceChildren(
      ...meal.menu.map((item) => {
        const menuItem = document.createElement("div");
        menuItem.className = "detail-menu-item";
        menuItem.textContent = item;
        return menuItem;
      }),
    );
    calendarDetailUseButton.hidden = false;
  } else {
    calendarDetailMenu.innerHTML = `<p class="notice">이 날짜의 급식 정보가 아직 없어요. 한 달 급식 불러오기를 먼저 눌러주세요.</p>`;
    calendarDetailUseButton.hidden = true;
  }

  calendarDetailModal.hidden = false;
}

function renderMonthCalendar() {
  const { start, end } = getMonthRange(formatMonth(selectedMonth));
  const firstWeekday = start.getDay();
  const daysInMonth = end.getDate();
  const cells = [];

  weekdays.forEach((day) => {
    cells.push(`<div class="calendar-weekday">${day}</div>`);
  });

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(`<div class="calendar-day muted"></div>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    const dateText = formatDate(date);
    const meal = getMealForDate(dateText);
    const isSelected = dateText === formatDate(selectedDate);
    const menuPreview = meal?.menu?.slice(0, 3).join(", ") || "";
    cells.push(`
      <button class="calendar-day ${isSelected ? "selected" : ""}" type="button" data-date="${dateText}">
        <span class="calendar-day-number">${day}</span>
        ${meal ? `<span class="calendar-meal">${menuPreview}</span>` : `<span class="calendar-empty">급식 정보 없음</span>`}
      </button>
    `);
  }

  monthCalendar.innerHTML = cells.join("");
  monthCalendar.querySelectorAll(".calendar-day[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      openCalendarDetail(button.dataset.date);
    });
  });
}

function useDetailDateAsMeal() {
  if (!detailDate) return;
  selectedDate = new Date(`${detailDate}T00:00:00`);
  currentMeals = { lunch: null, dinner: null };
  const meal = getMealForDate(detailDate);
  if (meal) {
    currentMeals[currentMealType] = {
      menu: meal.menu,
      calorie: meal.calorie,
      allergens: [],
      origin: "나이스 API 월간 급식 데이터",
    };
  }
  renderDate();
  renderMeal();
  renderMonthCalendar();
  closeCalendarDetail();
}

function saveSchool(school) {
  currentSchool = school;
  localStorage.setItem("meal-app-school", JSON.stringify(currentSchool));
  currentMeals = { lunch: null, dinner: null };
  monthlyMeals = [];
  renderSelectedSchool();
  renderMeal();
  renderMonthCalendar();
  renderMonthlyNotice("학교가 선택되었습니다. 한 달 급식 불러오기를 눌러주세요.");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`요청 실패: ${response.status}`);
  }
  return response.json();
}

async function fetchNeisProxy(proxyPath) {
  return fetchJson(`${NEIS_PROXY_BASE_URL}${proxyPath}`);
}

async function searchSchools() {
  const query = schoolInput.value.trim();
  if (!query) {
    schoolResults.innerHTML = `<p class="notice">학교 이름을 입력해주세요.</p>`;
    return;
  }

  setBusy(searchButton, true, "검색");
  schoolResults.innerHTML = "";

  try {
    const proxyParams = new URLSearchParams({
      name: query,
      limit: "8",
    });
    const data = await fetchNeisProxy(`/api/schools?${proxyParams}`);
    const rows = data.schoolInfo?.[1]?.row || [];

    if (!rows.length) {
      schoolResults.innerHTML = `<p class="notice">검색 결과가 없어요. 학교 이름을 다시 확인해주세요.</p>`;
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
    schoolResults.innerHTML = `<p class="notice">학교 검색에 실패했어요. 네트워크 상태를 확인해주세요.</p>`;
    console.error(error);
  } finally {
    setBusy(searchButton, false, "검색");
  }
}

async function loadMeal() {
  if (!currentSchool) {
    renderNotice("먼저 학교 검색에서 학교를 선택해주세요.");
    return;
  }

  setBusy(loadMealButton, true, "급식 불러오기");

  try {
    const proxyParams = new URLSearchParams({
      officeCode: currentSchool.officeCode,
      schoolCode: currentSchool.schoolCode,
      date: dateInput.value,
      mealType: currentMealType,
    });
    const data = await fetchNeisProxy(`/api/meal?${proxyParams}`);
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
    renderNotice("급식 조회에 실패했어요. 네트워크 상태나 학교 선택을 확인해주세요.");
    console.error(error);
  } finally {
    setBusy(loadMealButton, false, "급식 불러오기");
  }
}

async function loadMonthMeals() {
  if (!currentSchool) {
    renderMonthlyNotice("먼저 학교 검색에서 학교를 선택해주세요.");
    return;
  }

  setBusy(loadMonthButton, true, "한 달 급식 불러오기");

  try {
    const proxyParams = new URLSearchParams({
      officeCode: currentSchool.officeCode,
      schoolCode: currentSchool.schoolCode,
      month: monthInput.value,
      mealType: currentMealType,
    });
    const data = await fetchNeisProxy(`/api/meals/month?${proxyParams}`);
    const rows = data.mealServiceDietInfo?.[1]?.row || [];
    monthlyMeals = normalizeMonthlyMealRows(rows);
    renderMonthCalendar();
    renderMonthlyMeals(monthlyMeals);
  } catch (error) {
    renderMonthlyNotice("월간 급식 조회에 실패했어요. 네트워크 상태나 학교 선택을 확인해주세요.");
    console.error(error);
  } finally {
    setBusy(loadMonthButton, false, "한 달 급식 불러오기");
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
    schoolInput.value = profileSchool.value.trim();
    searchPanel.hidden = false;
    searchSchools();
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

searchButton.addEventListener("click", searchSchools);
loadMealButton.addEventListener("click", loadMeal);
loadMonthButton.addEventListener("click", loadMonthMeals);
closeCalendarDetailButton.addEventListener("click", closeCalendarDetail);
calendarDetailModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-calendar-detail]")) {
    closeCalendarDetail();
  }
});
calendarDetailUseButton.addEventListener("click", useDetailDateAsMeal);
schoolInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchSchools();
});

mealTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentMealType = tab.dataset.mealType;
    mealTabs.forEach((button) => button.classList.toggle("active", button === tab));
    monthlyMeals = [];
    renderMonthCalendar();
    renderMonthlyNotice("급식 종류가 바뀌었습니다. 한 달 급식 불러오기를 다시 눌러주세요.");
    renderMeal();
    renderUser();
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.targetPage);
  });
});

dateInput.addEventListener("change", () => {
  selectedDate = new Date(`${dateInput.value}T00:00:00`);
  selectedMonth = new Date(selectedDate);
  renderDate();
  renderMonthHeader();
  renderMonthCalendar();
});

monthInput.addEventListener("change", () => {
  selectedMonth = new Date(`${monthInput.value}-01T00:00:00`);
  selectedDate = new Date(selectedMonth);
  monthlyMeals = [];
  currentMeals = { lunch: null, dinner: null };
  renderDate();
  renderMonthHeader();
  renderMeal();
  renderMonthCalendar();
  renderMonthlyNotice("선택한 달의 급식을 나이스 API에서 불러오려면 한 달 급식 불러오기를 눌러주세요.");
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
