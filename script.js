const strokeDict = {
  "ㄱ": 2, "ㄲ": 4, "ㄴ": 2, "ㄷ": 3, "ㄸ": 6, "ㄹ": 5, "ㅁ": 4, "ㅂ": 4, "ㅃ": 8,
  "ㅅ": 2, "ㅆ": 4, "ㅇ": 1, "ㅈ": 3, "ㅉ": 6, "ㅊ": 4, "ㅋ": 3, "ㅌ": 4, "ㅍ": 4, "ㅎ": 3,
  "ㅏ": 2, "ㅐ": 3, "ㅑ": 3, "ㅒ": 4, "ㅓ": 2, "ㅔ": 3, "ㅕ": 3, "ㅖ": 4, "ㅗ": 2,
  "ㅘ": 4, "ㅙ": 5, "ㅚ": 3, "ㅛ": 3, "ㅜ": 2, "ㅝ": 4, "ㅞ": 5, "ㅟ": 3, "ㅠ": 3,
  "ㅡ": 1, "ㅢ": 2, "ㅣ": 1,
  "ㄳ": 4, "ㄵ": 5, "ㄶ": 5, "ㄺ": 7, "ㄻ": 9, "ㄼ": 9, "ㄽ": 7, "ㄾ": 9, "ㄿ": 9, "ㅀ": 8, "ㅄ": 6
};

function decompose(syllable) {
  const base = 44032;
  const choList = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const jungList = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
  const jongList = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const code = syllable.charCodeAt(0) - base;
  const cho = choList[Math.floor(code / 588)];
  const jung = jungList[Math.floor((code % 588) / 28)];
  const jong = jongList[code % 28];
  return jong ? [cho, jung, jong] : [cho, jung];
}

function hangulToStroke(char) {
  const parts = decompose(char);
  return parts.reduce((sum, ch) => sum + (strokeDict[ch] || 0), 0) % 10;
}

function isPerfectMatch(A1, A2, A3, B1, B2, B3) {
  return (
      (A1 + 3 * A2 + 3 * B1 + B2) % 10 === 1 &&
      (3 * A2 + A3 + B1 + 3 * B2) % 10 === 0 &&
      (A2 + 3 * A3 + 3 * B2 + B3) % 10 === 0
  );
}

function calculateScore(A1, A2, A3, B1, B2, B3) {
  const s1 = (A1 + 3 * A2 + 3 * B1 + B2) % 10;
  const s2 = (3 * A2 + A3 + B1 + 3 * B2) % 10;
  const s3 = (A2 + 3 * A3 + 3 * B2 + B3) % 10;
  return s1 * 10 + s2;
}

let lastMatches = [];
let last90Matches = [];

function findPerfectMatches() {
  const input = document.getElementById("myname").value.trim();
  const result = document.getElementById("match-result");
  result.innerHTML = "이름을 찾는 중...";

  if (input.length < 2 || input.length > 3) {
      result.innerHTML = "이름은 2~3글자만 입력 가능합니다.";
      return;
  }

  const A = [...input].map(hangulToStroke);
  if (A.length === 2) A.push(0);

  const firstEvenOdd = A[0] % 2;
  const lastEvenOdd = A[2] % 2;
  if (firstEvenOdd === lastEvenOdd) {
      result.innerHTML = "100점이 불가능한 이름입니다.";
      return;
  }

  fetch("surnames.json")
      .then(res => res.json())
      .then(surnames => {
          fetch("names.json")
              .then(res => res.json())
              .then(names => {
                  const matches = [];
                  for (const first_name of surnames) {
                      for (const name of names) {
                          const fullName = first_name + name;
                          const B = [...fullName].map(hangulToStroke);
                          if (B.length === 2) B.push(0);
                          if (isPerfectMatch(A[0], A[1], A[2], B[0], B[1], B[2])) {
                              matches.push(fullName);
                          }
                      }
                  }

                  lastMatches = matches;

                  if (matches.length === 0) {
                      result.innerHTML = "100점 궁합인 이름이 없습니다.";
                  } else {
                      result.innerHTML = `<b>${input}</b>님과 100점 궁합인 이름:<br><br>` +
                          matches.map(n => `💘 ${n}`).join("<br>");
                  }
              });
      });
}

function find90Matches() {
  const input = document.getElementById("myname").value.trim();
  const result = document.getElementById("match-result");
  result.innerHTML = "90점대 이름을 찾는 중...";

  if (input.length < 2 || input.length > 3) {
      result.innerHTML = "이름은 2~3글자만 입력 가능합니다.";
      return;
  }

  const A = [...input].map(hangulToStroke);
  if (A.length === 2) A.push(0);

  fetch("surnames.json")
      .then(res => res.json())
      .then(surnames => {
          fetch("names.json")
              .then(res => res.json())
              .then(names => {
                  const matches = [];
                  for (const first_name of surnames) {
                      for (const name of names) {
                          const fullName = first_name + name;
                          const B = [...fullName].map(hangulToStroke);
                          if (B.length === 2) B.push(0);
                          const score = calculateScore(A[0], A[1], A[2], B[0], B[1], B[2]);
                          if (score >= 90 && score < 100) {
                              matches.push({ name: fullName, score });
                          }
                      }
                  }

                  last90Matches = matches;

                  if (matches.length === 0) {
                      result.innerHTML = "90점대가 불가능한 이름입니다.";
                  } else {
                      result.innerHTML = "90점대에서 보고 싶은 점수를 입력하세요 (예: 95)";
                  }
              });
      });
}

function filterByScore() {
  const score = document.getElementById("score-filter").value.trim();
  const result = document.getElementById("match-result");

  if (!score || isNaN(score)) {
    result.innerHTML = "숫자로 된 점수를 입력하세요!";
    return;
  }

  if (last90Matches.length === 0) {
    result.innerHTML = "먼저 이름을 입력하고 90점대 궁합을 찾으세요!";
    return;
  }

  const filtered = last90Matches.filter(m => m.score === Number(score));
  if (filtered.length === 0) {
    result.innerHTML = `${score}점 궁합 이름이 없습니다.`;
  } else {
    result.innerHTML = `<b>${score}점 궁합 이름:</b><br><br>` +
      filtered.map(m => `💘 ${m.name}`).join("<br>");
  }
}


function filterBySurname() {
  const filter = document.getElementById("filter-surname").value.trim();
  const result = document.getElementById("match-result");

  if (!filter) {
    result.innerHTML = "성씨를 입력하세요!";
    return;
  }

  if (lastMatches.length > 0) {
    const filtered = lastMatches.filter(name => name.startsWith(filter));
    result.innerHTML = filtered.length === 0
      ? `${filter}씨 성을 가진 100점 궁합 이름이 없습니다.`
      : `<b>${filter}</b>씨 성을 가진 100점 궁합:<br><br>` +
        filtered.map(n => `💘 ${n}`).join("<br>");
  } else if (last90Matches.length > 0) {
    const filtered = last90Matches.filter(m => m.name.startsWith(filter));
    if (filtered.length === 0) {
      result.innerHTML = `${filter}씨 성을 가진 90점대 궁합 이름이 없습니다.`;
    } else {
      // 점수별로 그룹화
      const grouped = {};
      filtered.forEach(m => {
        if (!grouped[m.score]) grouped[m.score] = [];
        grouped[m.score].push(m.name);
      });
      result.innerHTML = `<b>${filter}</b>씨 성을 가진 90점대 궁합:<br><br>` +
        Object.keys(grouped).sort().map(score =>
          `<b>${score}점:</b><br>` +
          grouped[score].map(name => `💘 ${name}`).join("<br>")
        ).join("<br><br>");
    }
  } else {
    result.innerHTML = "먼저 이름을 입력하고 궁합을 찾으세요!";
  }
}



function resetFilter() {
  const result = document.getElementById("match-result");

  if (lastMatches.length > 0) {
      result.innerHTML = `<b>전체 100점 궁합 이름:</b><br><br>` +
          lastMatches.map(n => `💘 ${n}`).join("<br>");
  } else if (last90Matches.length > 0) {
      result.innerHTML = `<b>전체 90점대 궁합 이름 (점수 선택 후 필터링 가능):</b>`;
  } else {
      result.innerHTML = "먼저 이름을 입력하고 궁합을 찾으세요!";
  }
}
