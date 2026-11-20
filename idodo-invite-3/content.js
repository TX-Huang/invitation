/*
 * Dodo 的生日晚餐邀請函：所有文字、時間、地點都在這個檔。
 * 要改內容只改這裡，改完存檔、推上 GitHub 就好。
 */
window.BDAY_CONTENT = {
  to: 'Dodo',

  // 署名
  from: 'Isaac',

  // 晚餐時間（台灣時間）
  date: '2026-12-12T18:30:00+08:00',

  venue: {
    name: 'Terzo',
    area: '竹北',
    // 有確切地址就寫上去（地圖會搜尋地址）；沒有就寫 null，地圖會搜尋「Terzo 竹北」。
    address: null,
  },

  // 想對 Dodo 說的話：一個字串是一段。【請換成自己的話】
  letter: [
    '（這裡放想對 Dodo 說的話。）',
    '（可以寫好幾段，一段放一行，用引號包起來，後面加逗號。）',
  ],

  // 畫面上固定的字
  text: {
    tapToOpen: '輕觸打開',
    openLabel: '打開邀請函',
    happyBirthday: 'Happy Birthday',
    scroll: '往下看',
    inviteTitle: 'To Dodo',
    inviteLine: '想請妳一起吃一頓生日晚餐',
    countdownTitle: '生日倒數',
    countdownPast: '生日快樂！謝謝妳來',
    days: '天',
    hours: '時',
    minutes: '分',
    seconds: '秒',
    placeTitle: '地點',
    map: '查看地圖',
    letterTitle: '想對妳說的話',
    footer: '12 月 12 日，等妳來',
  },
};
