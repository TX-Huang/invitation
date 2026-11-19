/*
 * Isaac & Dodo 婚禮邀請卡：所有文字、日期、地點都在這個檔。
 * 要改內容只改這裡，改完存檔、推上 GitHub 就好。
 */
window.IDODO_CONTENT = {
  couple: 'Isaac & Dodo',

  // 婚禮開始的時間（台灣時間）。還沒決定就寫 null。
  // 例：date: '2027-05-20T17:00:00+08:00',
  date: null,

  venue: {
    // 還沒決定就寫 null。例：name: { zh: '某某莊園', en: 'XX Estate' },
    name: null,
    // 例：address: '新竹縣竹北市○○路 1 號',
    address: null,
  },

  // 背景音樂。有了檔案就寫 'art/music.mp3'，沒有就寫 null。
  music: null,

  // 我們的故事：一個字串是一段。【暫定文字，請換成你們自己的故事】
  story: {
    zh: [
      '有些故事，是從一個很普通的日子開始的。',
      '一次剛好的相遇，變成聊不完的話、說走就走的小旅行，還有好多一起笑到肚子痛的時刻。',
      '走著走著，我們發現最喜歡的地方，就是彼此的身邊。',
      '現在，我們準備好一起去最遠的地方了——一輩子。',
    ],
    en: [
      'Some stories begin on a perfectly ordinary day.',
      'A chance meeting turned into endless conversations, spontaneous little trips, and far too many laughs.',
      'Somewhere along the way, we found our favourite place: right next to each other.',
      "And now we're ready for the longest adventure of all — a lifetime together.",
    ],
  },

  // 當天流程。【時間是暫定的，日期地點定了再改】
  // icon 可以用：welcome, ceremony, cocktail, dinner, cake, dance, stars, goodnight
  program: [
    { time: '16:30', icon: 'welcome', zh: '賓客入場・迎賓飲品', en: 'Guests Arrival & Welcome Drinks' },
    { time: '17:00', icon: 'ceremony', zh: '證婚儀式', en: 'Ceremony' },
    { time: '17:45', icon: 'cocktail', zh: '雞尾酒時光', en: 'Cocktail Hour' },
    { time: '18:30', icon: 'dinner', zh: '晚宴', en: 'Dinner' },
    { time: '20:00', icon: 'cake', zh: '切蛋糕・舉杯', en: 'Cake & Toasts' },
    { time: '20:30', icon: 'dance', zh: '第一支舞', en: 'First Dance' },
    { time: '21:00', icon: 'stars', zh: '星空下跳舞', en: 'Dancing under the Stars' },
    { time: '22:30', icon: 'goodnight', zh: '晚安', en: 'Goodnight' },
  ],

  // 畫面上固定的字
  text: {
    zh: {
      tapToOpen: '輕觸打開',
      openLabel: '打開邀請卡',
      eyebrow: '誠摯邀請您參加我們的婚禮',
      dear: '親愛的',
      dearFriend: '親愛的朋友',
      dateTba: '日期即將公布',
      venueLabel: '婚禮地點',
      venueTba: '地點即將公布',
      scroll: '往下看',
      countdownTitle: '倒數',
      countdownUntil: '距離 {date}',
      countdownUnset: '日期確定後就開始倒數',
      countdownPast: '我們結婚啦！謝謝你們的祝福',
      days: '天',
      hours: '時',
      minutes: '分',
      seconds: '秒',
      storyTitle: '我們的故事',
      celebrationTitle: '婚禮資訊',
      celebrationSub: '證婚・晚宴',
      map: '查看地圖',
      dayTitle: '當天流程',
      dayEyebrow: '流程',
      footer: '期待與你相見',
      music: '音樂',
      hostTitle: '做給每位朋友的專屬連結',
      hostLead: '名字一行一個貼進來，按「產生連結」。朋友點開自己的連結，就會看到寫著他名字的邀請卡。',
      hostPlaceholder: '一行一個名字\n林小美\nAmy',
      hostMake: '產生連結',
      hostCopyAll: '全部複製',
      hostCopy: '複製',
      hostCopied: '已複製',
      hostNote: '沒有名字的通用連結就是網址本身，可以直接丟群組。',
    },
    en: {
      tapToOpen: 'Tap to open',
      openLabel: 'Open the invitation',
      eyebrow: 'We invite you to celebrate our wedding',
      dear: 'Dear',
      dearFriend: 'Dear friend',
      dateTba: 'Date to be announced',
      venueLabel: 'To be held at',
      venueTba: 'Venue to be announced',
      scroll: 'Scroll down',
      countdownTitle: 'Countdown',
      countdownUntil: 'Until {date}',
      countdownUnset: 'The countdown starts once the date is set',
      countdownPast: "We're married! Thank you for celebrating with us",
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      storyTitle: 'Our Story',
      celebrationTitle: 'The Celebration',
      celebrationSub: 'Ceremony & Dinner',
      map: 'View on map',
      dayTitle: 'The Day',
      dayEyebrow: 'Program',
      footer: "We can't wait to celebrate with you",
      music: 'Music',
      hostTitle: 'Personal links for each guest',
      hostLead: 'Paste one name per line and press "Make links". Each guest sees a card with their own name.',
      hostPlaceholder: 'One name per line\nAmy\nJohn & Mary',
      hostMake: 'Make links',
      hostCopyAll: 'Copy all',
      hostCopy: 'Copy',
      hostCopied: 'Copied',
      hostNote: 'The plain page address (no name) works as a general invitation for group chats.',
    },
  },
};
