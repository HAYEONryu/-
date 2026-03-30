/**
 * RSVP → 구글 시트 기록용 웹앱
 *
 * [시트 준비]
 * 1) 새 구글 스프레드시트 생성
 * 2) 시트 이름을 "RSVP" 로 두거나, 첫 번째 탭을 사용합니다(스크립트가 RSVP 탭 없으면 첫 탭 사용).
 *
 * [Apps Script 붙여넣기]
 * 3) 스프레드시트에서 확장 프로그램 → Apps Script
 * 4) 기본 코드 지우고 이 파일 전체를 붙여넣은 뒤 저장(디스크 아이콘)
 *
 * [웹 앱 배포]
 * 5) 배포 → 새 배포 → 유형: 웹 앱
 *    - 설명: RSVP 수집
 *    - 실행: 나
 *    - 액세스 권한: 모든 사용자 (익명 포함이어도 됨)
 * 6) 배포 후 표시되는 URL 중 ".../exec" 로 끝나는 주소를 복사
 * 7) public/index.html 안 RSVP_SHEET_WEBAPP_URL 에 그 URL 을 넣고 저장·배포
 *
 * [보안]
 * - URL이 노출되면 누구나 행을 추가할 수 있습니다. 스팸 방지가 필요하면
 *   스크립트에 시크릿 토큰 검사(아래 주석 참고)를 추가하세요.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var raw =
      (e.parameter && e.parameter.data) ||
      (e.postData && e.postData.type === "application/json" && e.postData.contents) ||
      "{}";
    var data = JSON.parse(raw);

    // 선택: PropertiesService.getScriptProperties().setProperty('RSVP_SECRET','임의문자열');
    // 청첩장에서 같은 값을 token 필드로 보내면 검증 가능
    // var secret = PropertiesService.getScriptProperties().getProperty("RSVP_SECRET");
    // if (secret && data.token !== secret) {
    //   return jsonOut({ ok: false, message: "unauthorized" });
    // }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("RSVP") || ss.getSheets()[0];
    if (sh.getLastRow() === 0) {
      sh.appendRow(["제출시각", "하객", "참석", "성함", "동행", "뒤4자리"]);
    }

    var guest = data.guest === "bride" ? "신부" : "신랑";
    var attend = data.attend === "no" ? "참석이 어려워요" : "참석할게요";
    var comp = data.companion === "yes" ? "있습니다" : "없습니다";
    var phone = data.phoneLast4 ? String(data.phoneLast4) : "";

    sh.appendRow([
      new Date(),
      guest,
      attend,
      String(data.name || "").trim(),
      comp,
      phone,
    ]);

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, message: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/** 브라우저에서 URL 열어 연결 테스트용 */
function doGet() {
  return jsonOut({ ok: true, ping: "rsvp-webapp" });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
