const apiKeyInput = document.querySelector("#apiKeyInput");
const schoolInput = document.querySelector("#schoolInput");
const searchButton = document.querySelector("#searchButton");
const schoolResults = document.querySelector("#schoolResults");
const selectedSchool = document.querySelector("#selectedSchool");
const dateInput = document.querySelector("#dateInput");
const mealCard = document.querySelector("#mealCard");
const loadMealButton = document.querySelector("#loadMealButton");
const sampleButton = document.querySelector("#sampleButton");
const todayLabel = document.querySelector("#todayLabel");
const dayName = document.querySelector("#dayName");

const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const sampleSchool = {
  name: "테스트 학교",
  officeCode: "B10",
  schoolCode: "7010057",
};

const sampleMeal = {
  menu: ["찰현미밥", "맑은미역국", "닭갈비", "감자채볶음", "배추김치", "요구르트"],
  calorie: "812.4 Kcal",
  origin: "예시 데이터",
};

let currentSchool = JSON.parse(localStorage.getItem("meal-app-school")) || sampleSchool;

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toNeisDate(value) {
  return value.replaceAll("-", "");
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

function initDate() {
  const now = new Date();
  const dateText = formatDate(now);
  dateInput.value = dateText;
  todayLabel.textContent = dateText.replaceAll("-", ".");
  dayName.textContent = weekdays[now.getDay()];
}

function renderSelectedSchool() {
  selectedSchool.textContent = currentSchool.name;
}

function renderMeal(meal) {
  const menuItems = meal.menu.map((item) => `<li>${item}</li>`).join("");
  mealCard.innerHTML = `
    <div class="meal-title">
      <div>
        <p class="eyebrow">${meal.origin}</p>
        <h3>${dateInput.value} 점심</h3>
      </div>
      <span class="calorie">${meal.calorie || "칼로리 정보 없음"}</span>
    </div>
    <ul class="menu-list">${menuItems}</ul>
  `;
}

function renderNotice(message) {
  mealCard.innerHTML = `<p class="notice">${message}</p>`;
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

  const key = apiKeyInput.value.trim();
  const params = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: "8",
    SCHUL_NM: query,
  });
  if (key) params.set("KEY", key);

  setBusy(searchButton, true, "학교 검색");
  schoolResults.innerHTML = "";

  try {
    const data = await fetchJson(`https://open.neis.go.kr/hub/schoolInfo?${params}`);
    const rows = data.schoolInfo?.[1]?.row || [];

    if (!rows.length) {
      schoolResults.innerHTML = `<p class="notice">검색 결과가 없어요. API 키가 없다면 예시 보기로 먼저 테스트해보세요.</p>`;
      return;
    }

    schoolResults.innerHTML = rows
      .map(
        (school, index) => `
          <button class="school-button" type="button" data-index="${index}">
            <strong>${school.SCHUL_NM}</strong><br />
            ${school.ORG_RDNMA || school.LCTN_SC_NM || "주소 정보 없음"}
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
        schoolResults.innerHTML = `<p class="notice">${school.SCHUL_NM} 선택 완료. 이제 급식을 불러와보세요.</p>`;
      });
    });
  } catch (error) {
    schoolResults.innerHTML = `<p class="notice">학교 검색에 실패했어요. API 키를 확인하거나 예시 데이터로 테스트해보세요.</p>`;
    console.error(error);
  } finally {
    setBusy(searchButton, false, "학교 검색");
  }
}

async function loadMeal() {
  const key = apiKeyInput.value.trim();
  const params = new URLSearchParams({
    Type: "json",
    ATPT_OFCDC_SC_CODE: currentSchool.officeCode,
    SD_SCHUL_CODE: currentSchool.schoolCode,
    MLSV_YMD: toNeisDate(dateInput.value),
    MMEAL_SC_CODE: "2",
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

    renderMeal({
      menu: cleanMenuText(meal.DDISH_NM),
      calorie: meal.CAL_INFO,
      origin: `${currentSchool.name} 공식 급식 데이터`,
    });
  } catch (error) {
    renderNotice("급식 조회에 실패했어요. API 키가 없거나 네트워크/CORS 문제가 있으면 예시 보기로 화면을 확인할 수 있습니다.");
    console.error(error);
  } finally {
    setBusy(loadMealButton, false, "급식 불러오기");
  }
}

searchButton.addEventListener("click", searchSchools);
loadMealButton.addEventListener("click", loadMeal);
sampleButton.addEventListener("click", () => renderMeal(sampleMeal));
schoolInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchSchools();
});

initDate();
renderSelectedSchool();
renderMeal(sampleMeal);
