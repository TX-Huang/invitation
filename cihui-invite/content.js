/*
 * 慈惠道場 堂慶 邀請函：所有文字、日期、地點都在這個檔。
 * 要改內容只改這裡，改完存檔、推上 GitHub 就好。
 * 給個別的人換名字、換開場、換邀請函上的字，不用改這裡：用「?host」那頁產生連結。
 */
window.CIHUI_CONTENT = {
  host: '慈惠道場',

  // 邀請函上的大字
  title: '堂慶',

  // 開場：'a' 雲散霧開、'b' 金光法陣、'c' 兩者混合。連結沒寫 ?open= 的時候用這個。
  opening: 'c',

  // 堂慶的日子（國曆）。
  days: ['2027-01-16', '2027-01-17'],

  // 第一天開始的時間（台灣時間），倒數會算到這一刻。還沒決定就寫 null（會倒數到第一天 0 點）。
  // 例：start: '2027-01-16T09:00:00+08:00',
  start: null,

  // 邀請函上的內文，一個字串是一行（直排的一行）。
  // 寫 null 就自動用日期：「謹訂於國曆二〇二七年／一月十六日至十七日／恭請蒞臨 同霑法喜」。
  message: null,

  venue: {
    name: '慈惠道場',
    // 還沒決定就寫 null。例：address: '新竹縣竹北市○○路 1 號',
    address: null,
  },

  // 流程。還沒決定就留空 []，頁面會寫「流程待公布」。
  // day 是第幾天（1 或 2）。例：{ day: 1, time: '09:00', title: '恭迎聖駕' },
  program: [],

  // 道場網站
  site: 'https://tx-huang.github.io/cihui-website/',

  // 道場神尊
  deities: [
    { key: 'jinmu', name: '瑤池金母', role: '主祀' },
    { key: 'xuannu', name: '九天玄女', role: '陪祀' },
    { key: 'nezha', name: '中壇元帥', role: '陪祀' },
    { key: 'tudi', name: '福德正神', role: '陪祀' },
  ],

  // 畫面上固定的字
  text: {
    tapToOpen: '輕觸開啟',
    openLabel: '開啟邀請函',
    sealLabel: '慈惠道場印',
    invite: '敬邀',
    everyone: '十方大德',
    sealed: '台啟',
    held: '謹訂於',
    welcome: '恭請蒞臨 同霑法喜',
    signature: '慈惠道場 敬邀',
    scroll: '往下看',
    datesTitle: '堂慶日期',
    timeTba: '時間待公布',
    placeTitle: '地點',
    addressTba: '地址待公布',
    map: '查看地圖',
    countdownTitle: '堂慶倒數',
    countdownPast: '堂慶圓滿，感恩大家護持',
    days: '天',
    hours: '時',
    minutes: '分',
    seconds: '秒',
    programTitle: '法會流程',
    programTba: '流程待公布',
    deitiesTitle: '道場神尊',
    siteLink: '慈惠道場網站',
    hostTitle: '做給每位大德的專屬連結',
    hostLead: '選好開場、改好邀請函上的字，再把名字一行一個貼進來，按「產生連結」。對方點開自己的連結，就會看到寫著他名字的邀請函。',
    hostOpen: '開場',
    hostOpenA: '雲散霧開',
    hostOpenB: '金光法陣',
    hostOpenC: '兩者混合',
    hostWords: '邀請函上的字',
    hostTitleLabel: '大字',
    hostMsgLabel: '內文（一行一句，直排）',
    hostSignLabel: '署名',
    hostReset: '還原',
    hostNamesLabel: '名字（一行一個）',
    hostPlaceholder: '林小美師姐\n王大明師兄',
    hostMake: '產生連結',
    hostGeneral: '通用連結（沒有名字，可以直接丟群組）',
    hostCopyAll: '全部複製',
    hostCopy: '複製',
    hostCopied: '已複製',
    hostPreview: '預覽',
    hostNote: '連結裡只會帶有改過的字；沒改的就用這張邀請函本來的字。',
  },
};
