// 한글 자모 분해용
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
  
  let lastMatches = []; // 필터링을 위해 전역에 저장
  
  function findPerfectMatches() {
    const input = document.getElementById("myname").value.trim();
    const result = document.getElementById("match-result");
    result.innerHTML = "이름을 찾는 중...";
  
    if (input.length < 2 || input.length > 3) {
      result.innerHTML = "이름은 2~3글자만 입력 가능합니다.";
      return;
    }
  
    const A = [...input].map(hangulToStroke);
    if (A.length === 2) A.push(0); // A3 = 0 처리
  
    fetch("surnames.json")
      .then(res => res.json())
      .then(surnames => {
        fetch("names.json")
          .then(res => res.json())
          .then(names => {
            const matches = [];
  
            for (const first_name of surnames) {
              if ((A[0] - A[2]) % 2 === 0) continue;
  
              for (const name of names) {
                const fullName = first_name + name;
                const B = [...fullName].map(hangulToStroke);
                if (B.length === 2) B.push(0);
                if (isPerfectMatch(A[0], A[1], A[2], B[0], B[1], B[2])) {
                  matches.push(fullName);
                }
              }
            }
  
            lastMatches = matches; // 필터링용 저장
  
            if (matches.length === 0) {
              result.innerHTML = "100점 궁합인 이름이 없습니다.";
            } else {
              result.innerHTML = `<b>${input}</b>님과 100점 궁합인 이름:<br><br>` +
                matches.slice(0, 20).map(n => `💘 ${n}`).join("<br>");
            }
          })
          .catch(err => {
            console.error("이름 목록 오류:", err);
            result.innerHTML = "이름 데이터를 불러오는 데 실패했습니다.";
          });
      })
      .catch(err => {
        console.error("성씨 목록 오류:", err);
        result.innerHTML = "성씨 데이터를 불러오는 데 실패했습니다.";
      });
  }
  
  function filterBySurname() {
    const filter = document.getElementById("filter-surname").value.trim();
    const result = document.getElementById("match-result");
  
    if (!filter || !lastMatches.length) {
      result.innerHTML = "먼저 이름을 입력하고 궁합을 찾으세요!";
      return;
    }
  
    const filtered = lastMatches.filter(name => name.startsWith(filter));
    if (filtered.length === 0) {
      result.innerHTML = `${filter}씨 성을 가진 100점 궁합 이름이 없습니다.`;
    } else {
      result.innerHTML = `<b>${filter}</b>씨 성을 가진 100점 궁합 이름:<br><br>` +
        filtered.map(n => `💘 ${n}`).join("<br>");
    }
  }
  