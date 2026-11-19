/*
 * 慈惠道場 堂慶 邀請函：所有文字、日期、地點都在這個檔。
 * 要改內容只改這裡，改完存檔、推上 GitHub 就好。
 */
window.CIHUI_CONTENT = {
  host: '慈惠道場',
  event: '堂慶',

  // 堂慶的日子（國曆）。
  days: ['2027-01-16', '2027-01-17'],

  // 第一天開始的時間（台灣時間），倒數會算到這一刻。還沒決定就寫 null（會倒數到第一天 0 點）。
  // 例：start: '2027-01-16T09:00:00+08:00',
  start: null,

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
    tapToOpen: '輕觸拆信',
    openLabel: '拆開邀請函',
    invite: '敬邀',
    everyone: '十方大德',
    sealed: '台啟',
    from: '慈惠道場 緘',
    held: '謹訂於',
    holding: '舉行慈惠道場堂慶',
    welcome: '恭請蒞臨 同霑法喜',
    signature: '慈惠道場 敬邀',
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
    credit: '匾額篆體：崇羲篆體（中央研究院），CC BY-ND 3.0 TW',
    hostTitle: '做給每位大德的專屬連結',
    hostLead: '名字一行一個貼進來，按「產生連結」。對方點開自己的連結，信封上就會寫著他的名字。',
    hostPlaceholder: '一行一個名字\n林小美師姐\n王大明師兄',
    hostMake: '產生連結',
    hostCopyAll: '全部複製',
    hostCopy: '複製',
    hostCopied: '已複製',
    hostNote: '沒有名字的通用連結就是網址本身，可以直接丟群組。',
  },
};
