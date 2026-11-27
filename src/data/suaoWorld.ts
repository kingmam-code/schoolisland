import { Collectible, Landmark, School, TransportMode, ZoneId } from '../types';

export const WORLD_W = 2000;
export const WORLD_H = 1380;

export const ZONES: Record<ZoneId, { name: string; color: string; description: string }> = {
  xinma: {
    name: '新馬食農平原',
    color: '#2F855A',
    description: '北側平原聚落，匯聚馬賽、文化與育英的農田與社區活力。',
  },
  harbor: {
    name: '無尾港與蘇澳港',
    color: '#0E7490',
    description: '濕地候鳥與海洋帆船交會的海岸線，連結港灣與海洋探索。',
  },
  downtown: {
    name: '冷泉市鎮與白米谷',
    color: '#2B6CB0',
    description: '擁有天然碳酸冷泉、火車站與白米木屐山谷的蘇澳核心地帶。',
  },
  nanfango: {
    name: '南方澳漁港',
    color: '#C05621',
    description: '鯖魚的故鄉與跨港大橋所在地，充滿漁村人情與雙語能量。',
  },
  dananao: {
    name: '大南澳山海線',
    color: '#744210',
    description: '蘇澳南端朝陽與南強的山海灣，沿著海岸與步道聽見浪濤聲。',
  },
};

export const TRANSPORT_META: Record<
  TransportMode,
  { label: string; speed: number; unlockHint: string }
> = {
  walk: {
    label: '步行探索',
    speed: 230,
    unlockHint: '初始移動方式',
  },
  clog: {
    label: '白米木屐滑板',
    speed: 310,
    unlockHint: '集滿 2 枚校章或 3 個在地紀念物解鎖',
  },
  bike: {
    label: '冷泉腳踏車',
    speed: 390,
    unlockHint: '集滿 5 枚校章解鎖',
  },
  sailboat: {
    label: '岳明小帆船',
    speed: 350,
    unlockHint: '通過岳明國中小或集滿 7 枚校章解鎖（可航行海域）',
  },
};

// Main Su'ao landmass polygon (clockwise)
export const LAND_POLYGON: [number, number][] = [
  [340, 72],
  [1215, 72],
  [1365, 175],
  [1465, 290],
  [1545, 345],
  [1555, 422],
  [1405, 442],
  [1318, 472],
  [1425, 522],
  [1455, 602],
  [1295, 646],
  [1255, 722],
  [1435, 756],
  [1562, 812],
  [1542, 896],
  [1395, 912],
  [1295, 955],
  [1325, 1058],
  [1452, 1142],
  [1422, 1265],
  [1235, 1305],
  [680, 1312],
  [275, 1268],
  [122, 1075],
  [96, 755],
  [106, 415],
  [145, 145],
];

// Navigable bridge corridors over harbor water
export const BRIDGES: { x1: number; y1: number; x2: number; y2: number; width: number; name: string }[] = [
  { x1: 1365, y1: 605, x2: 1390, y2: 765, width: 44, name: '蘇澳港灣連通道' },
  { x1: 1355, y1: 435, x2: 1375, y2: 525, width: 42, name: '無尾港生態木棧橋' },
];

// Road network segments drawn on the map
export const ROADS: [number, number][][] = [
  // North-South Provincial Highway (台2 / 台9 概念幹線)
  [
    [530, 215],
    [790, 250],
    [1060, 225],
  ],
  [
    [790, 250],
    [880, 440],
    [950, 635],
    [795, 735],
    [960, 880],
    [1180, 1040],
    [1255, 1185],
  ],
  // Harbor coastal road
  [
    [1060, 225],
    [1280, 345],
    [1425, 360],
  ],
  [
    [1280, 345],
    [1365, 435],
    [1375, 525],
    [1295, 555],
  ],
  [
    [950, 635],
    [1150, 605],
    [1295, 555],
  ],
  // Bridge to Nanfang'ao
  [
    [1365, 605],
    [1390, 765],
    [1330, 820],
    [1455, 845],
  ],
  [
    [960, 880],
    [1185, 835],
    [1330, 820],
  ],
  // Baimi Valley road
  [
    [795, 735],
    [615, 775],
    [450, 810],
  ],
];

// Railway track (宜蘭線 / 北迴線意象)
export const RAILWAY_POINTS: [number, number][] = [
  [360, 90],
  [580, 330],
  [795, 520],
  [905, 675],
  [720, 895],
  [540, 1080],
  [440, 1265],
];

export const LANDMARKS: Landmark[] = [
  {
    id: 'cold-spring',
    name: '蘇澳冷泉公園',
    subtitle: '恆溫 22°C 天然碳酸泉',
    x: 915,
    y: 675,
    kind: 'spring',
  },
  {
    id: 'wuwei-wetland',
    name: '無尾港水鳥保護區',
    subtitle: '冬候鳥棲息的海岸濕地',
    x: 1365,
    y: 315,
    kind: 'wetland',
  },
  {
    id: 'cross-bridge',
    name: '南方澳跨港大橋',
    subtitle: '連接漁港與半島的地標橋樑',
    x: 1385,
    y: 690,
    kind: 'bridge',
  },
  {
    id: 'suao-station',
    name: '蘇澳鐵道與白米車站',
    subtitle: '通往山谷與海灣的鐵道風景',
    x: 680,
    y: 790,
    kind: 'train',
  },
  {
    id: 'tofu-cape',
    name: '豆腐岬海灣',
    subtitle: '適合觀察珊瑚礁與潮間帶',
    x: 1525,
    y: 865,
    kind: 'bay',
  },
  {
    id: 'chaoyang-bay',
    name: '朝陽國家步道與漁港',
    subtitle: '山海交會的大南澳海灣',
    x: 1360,
    y: 1175,
    kind: 'lighthouse',
  },
];

export const SCHOOLS: School[] = [
  {
    id: 'masai-es',
    name: '宜蘭縣立馬賽國民小學',
    shortName: '馬賽國小',
    category: 'elementary',
    categoryLabel: '國小',
    zone: 'xinma',
    zoneLabel: '新馬食農平原',
    address: '蘇澳鎮大同路',
    x: 790,
    y: 250,
    accentColor: '#2F855A',
    roofColor: '#D97706',
    npcName: '阿賽學長',
    npcTitle: '新馬生活圈嚮導',
    greeting: '歡迎來到馬賽國小！我們位在人口活力滿滿的新馬地區，一起來挑戰新馬社區生活題吧。',
    featureSummary: '位於新馬地區的重要學區小學，結合基礎學力與多元社團文化。',
    landmarkName: '新馬活力操場',
    stampTitle: '新馬平原章',
    questions: {
      elementary: [
        {
          id: 'ms-e1',
          prompt: '馬賽國小位在蘇澳鎮北邊的哪一個生活圈，和龍德工業區、文化國中相鄰？',
          options: ['新馬地區', '南方澳漁港', '大南澳朝陽區'],
          answerIndex: 0,
          explanation: '馬賽國小與文化國中都在蘇澳北端的新馬地區，交通與生活機能便利。',
        },
        {
          id: 'ms-e2',
          prompt: '在新馬平原參加校園社團或運動時，下列哪一種做法最能展現團隊合作？',
          options: ['分工合作並互相鼓勵', '只顧著自己拿第一', '不理會隊友的想法'],
          answerIndex: 0,
          explanation: '透過傾聽與分工，能讓班級與社團活動更有向心力。',
        },
      ],
      junior: [
        {
          id: 'ms-j1',
          prompt: '蘇澳鎮北側的新馬地區因鄰近哪一項重要交通與產業設施，成為人口成長較快的區域？',
          options: ['蘇澳交流道與龍德、利澤工業區', '中橫公路與梨山果園', '墾丁國家公園'],
          answerIndex: 0,
          explanation: '國道五號蘇澳端與龍德工業區帶動就業與居住人口，使新馬地區成為蘇澳北端生活重心。',
        },
        {
          id: 'ms-j2',
          prompt: '從馬賽國小出發向南前往蘇澳市區，大致是沿著哪一條台線公路方向移動？',
          options: ['台 9 線／台 2 線方向往南', '台 1 線往桃園方向', '台 11 線往台東'],
          answerIndex: 0,
          explanation: '台 9 線與台 2 線貫穿蘇澳鎮，串聯新馬平原與蘇澳市區。',
        },
      ],
    },
  },
  {
    id: 'wenhua-jh',
    name: '宜蘭縣立文化國民中學',
    shortName: '文化國中',
    category: 'junior',
    categoryLabel: '國中',
    zone: 'xinma',
    zoneLabel: '新馬食農平原',
    address: '蘇澳鎮新馬路',
    x: 530,
    y: 215,
    accentColor: '#2B6CB0',
    roofColor: '#2563EB',
    npcName: '文文老師',
    npcTitle: '科技人文領航員',
    greeting: '嗨！歡迎來到文化國中，我們連結社區與科技素養，準備好動腦思考了嗎？',
    featureSummary: '座落於新馬路，重視科技人文結合與學生多元適性發展的國中。',
    landmarkName: '創客人文廣場',
    stampTitle: '科技人文章',
    questions: {
      elementary: [
        {
          id: 'wh-e1',
          prompt: '當我們利用數位平板或電腦探索社區地圖時，下列哪一個習慣最重要？',
          options: ['保護個人密碼與帳號安全', '隨便把密碼告訴陌生人', '一直連續看螢幕不休息'],
          answerIndex: 0,
          explanation: '數位探索時保護個人資料與視力健康都很重要喔！',
        },
        {
          id: 'wh-e2',
          prompt: '蘇澳鎮北側的文化國中鄰近哪一條溪流與平原聚落？',
          options: ['新城溪與新馬平原', '濁水溪與彰化平原', '高屏溪'],
          answerIndex: 0,
          explanation: '新城溪流經新馬地區注入太平洋，是蘇澳北端重要的水系。',
        },
      ],
      junior: [
        {
          id: 'wh-j1',
          prompt: '鄰近龍德工業區的文化國中，若要規劃「社區與產業」跨領域專題，最適合探究什麼議題？',
          options: ['工業區綠能轉型與新城溪生態共存', '沙漠駱駝養殖技術', '高山冰河消融'],
          answerIndex: 0,
          explanation: '探討在地產業發展與環境永續的平衡，是新馬地區最具真實脈絡的公民與自然議題。',
        },
        {
          id: 'wh-j2',
          prompt: '在科學探究過程中，當觀察到社區水質或空氣數據異常時，第一步應採取什麼方法？',
          options: ['系統性採樣紀錄並比對變因', '直接猜測原因並下定論', '忽略異常數據'],
          answerIndex: 0,
          explanation: '客觀紀錄數據與控制變因，是科學探究的核心精神。',
        },
      ],
    },
  },
  {
    id: 'yuying-es',
    name: '宜蘭縣立育英國民小學',
    shortName: '育英國小',
    category: 'elementary',
    categoryLabel: '國小',
    zone: 'xinma',
    zoneLabel: '新馬食農平原',
    address: '蘇澳鎮福德路',
    x: 1060,
    y: 225,
    accentColor: '#38A169',
    roofColor: '#E11D48',
    npcName: '小英農夫',
    npcTitle: '食農田園小隊長',
    greeting: '聞到泥土的香氣了嗎？在育英國小，我們一起從土地種植、閱讀與社會情緒學習中成長！',
    featureSummary: '深耕食農教育、閱讀素養與歌仔戲等本土藝文社團的小學。',
    landmarkName: '四季食農菜園',
    stampTitle: '土地食農章',
    questions: {
      elementary: [
        {
          id: 'yy-e1',
          prompt: '育英國小的食農教育強調「從產地到餐桌」，請問吃在地當季蔬果有什麼好處？',
          options: ['減少運輸碳足跡又新鮮健康', '讓食物放更久都不會壞', '一定比較貴'],
          answerIndex: 0,
          explanation: '選擇在地當季食材能減少長途運送的能源消耗，也最能吃到食物原本的鮮甜！',
        },
        {
          id: 'yy-e2',
          prompt: '宜蘭是哪一種台灣傳統戲曲的重要發源地，育英國小也有推廣相關社團？',
          options: ['歌仔戲', '京劇臉譜', '西方歌劇'],
          answerIndex: 0,
          explanation: '歌仔戲起源於宜蘭，結合唱腔與身段，是珍貴的本土文化資產。',
        },
      ],
      junior: [
        {
          id: 'yy-j1',
          prompt: '在食農與生態循環中，將校園落葉與廚餘轉化為有機堆肥，這屬於資源循環中的哪一環？',
          options: ['分解者參與物質循環再利用', '直線式耗竭開採', '人造塑膠合成'],
          answerIndex: 0,
          explanation: '微生物與蚯蚓等分解者能將有機物轉化為植物可吸收的養分，落實永續農法。',
        },
        {
          id: 'yy-j2',
          prompt: '面對團隊衝突時，學校推動的「社會情緒學習（SEL）」最鼓勵怎麼做？',
          options: ['先覺察自身情緒並用同理心溝通', '立刻指責對方錯誤', '壓抑情緒不再說話'],
          answerIndex: 0,
          explanation: 'SEL 培養自我覺察、情緒管理與負責任的決策能力。',
        },
      ],
    },
  },
  {
    id: 'yueming',
    name: '宜蘭縣立岳明國民中小學',
    shortName: '岳明國中小',
    category: 'combined',
    categoryLabel: '國小＋國中',
    zone: 'harbor',
    zoneLabel: '無尾港與蘇澳港',
    address: '蘇澳鎮嶺腳路',
    x: 1425,
    y: 360,
    accentColor: '#0284C7',
    roofColor: '#0EA5E9',
    npcName: '海風船長',
    npcTitle: '帆船海洋課領隊',
    greeting: '乘風破浪的時候到了！岳明國中小同時有國小部與國中部，通過考驗就能解鎖「岳明小帆船」航行大海喔！',
    featureSummary: '全國知名的海洋實驗國民中小學，以風帆、獨木舟、無尾港濕地探索與海洋永續課程聞名。',
    landmarkName: '無尾港風帆基地',
    stampTitle: '海洋帆船章',
    questions: {
      elementary: [
        {
          id: 'ym-e1',
          prompt: '岳明國中小鄰近哪一個著名的冬候鳥棲地與海岸濕地？',
          options: ['無尾港水鳥保護區', '七星潭礫石灘', '日月潭'],
          answerIndex: 0,
          explanation: '無尾港緊鄰岳明國中小，每年秋冬都有許多雁鴨與水鳥前來過冬。',
        },
        {
          id: 'ym-e2',
          prompt: '在海上駕駛小帆船時，主要靠什麼力量推動帆船前進？',
          options: ['風力吹動風帆', '引擎燒柴油', '電池馬達'],
          answerIndex: 0,
          explanation: '帆船利用風帆調整角度迎風或順風航行，是低碳又親近海洋的運動。',
        },
      ],
      junior: [
        {
          id: 'ym-j1',
          prompt: '海邊淨灘時常發現大量廢棄漁網與塑膠微粒，這些塑膠垃圾對海洋食物鏈的主要威脅是什麼？',
          options: ['被海洋生物誤食並透過食物網累積', '會讓海水瞬間結冰', '能自然在一週內分解成養分'],
          answerIndex: 0,
          explanation: '塑膠微粒難以被生物分解，會隨營養階層放大累積，影響生態與人類健康。',
        },
        {
          id: 'ym-j2',
          prompt: '當帆船需要往「逆風斜前方」前進時，水手常採用哪一種航行策略？',
          options: ['走「之字形」換舷搶風航行（Tacking）', '原地收帆等待風向反轉', '把船帆完全降下來'],
          answerIndex: 0,
          explanation: '利用空氣動力學的升力原理，帆船能以約 45 度角輪流左右換舷（之字形）逆風前進。',
        },
      ],
    },
  },
  {
    id: 'shimin-es',
    name: '宜蘭縣立士敏國民小學',
    shortName: '士敏國小',
    category: 'elementary',
    categoryLabel: '國小',
    zone: 'harbor',
    zoneLabel: '無尾港與蘇澳港',
    address: '蘇澳鎮光明路',
    x: 1295,
    y: 555,
    accentColor: '#0E7490',
    roofColor: '#DC2626',
    npcName: '港灣守望員',
    npcTitle: '蘇澳港小導覽',
    greeting: '你看！前方就是忙碌的蘇澳商港與軍港。我們士敏國小就在港區旁，一起了解港口運作與安全知識吧！',
    featureSummary: '鄰近蘇澳港區，深耕社區互動、品格常規與體育藝文教育。',
    landmarkName: '蘇澳港燈塔哨站',
    stampTitle: '港灣守望章',
    questions: {
      elementary: [
        {
          id: 'sm-e1',
          prompt: '夜晚船隻靠近蘇澳港時，岸邊的燈塔主要提供什麼功能？',
          options: ['指引船隻航道方向與提醒暗礁位置', '幫海裡的魚照明睡覺', '用來烘乾漁網'],
          answerIndex: 0,
          explanation: '燈塔的燈光與閃爍節奏就像海上的交通號誌，守護船隻安全入港。',
        },
        {
          id: 'sm-e2',
          prompt: '在港區周邊走路或騎腳踏車時，遇到大型貨櫃車轉彎應該注意什麼？',
          options: ['保持安全距離，遠離大車內輪差與視線死角', '緊貼在貨車旁邊搶快通過', '站在轉彎路中間拍照'],
          answerIndex: 0,
          explanation: '港區大車多，避開視野死角與內輪差是最基本的交通安全守則。',
        },
      ],
      junior: [
        {
          id: 'sm-j1',
          prompt: '蘇澳港三面環山、開口朝向太平洋，這種天然地形對港口機能有什麼優勢？',
          options: ['可天然阻擋風浪，形成優良的避風港灣', '容易讓海水完全蒸發', '方便發展高山農業'],
          answerIndex: 0,
          explanation: '蘇澳港屬於天然良港，三面山巒屏障能減緩東北季風與長浪衝擊。',
        },
        {
          id: 'sm-j2',
          prompt: '為什麼許多港口城市的商港周邊會有水泥或砂石等大宗物資運輸，需特別注意空氣與道路維護？',
          options: ['海運大宗散貨運輸成本低，港區兼負貨物集散功能', '因為水泥只能在海水裡製造', '為了吸引候鳥棲息'],
          answerIndex: 0,
          explanation: '海運載量大、單位成本低，使港口成為區域物資進出與環境管理的重要節點。',
        },
      ],
    },
  },
  {
    id: 'suao-es',
    name: '宜蘭縣立蘇澳國民小學',
    shortName: '蘇澳國小',
    category: 'elementary',
    categoryLabel: '國小',
    zone: 'downtown',
    zoneLabel: '冷泉市鎮與白米谷',
    address: '蘇澳鎮中山路一段',
    x: 950,
    y: 635,
    accentColor: '#0369A1',
    roofColor: '#EA580C',
    npcName: '泉鯖小精靈',
    npcTitle: '百年老校小博士',
    greeting: '歡迎來到百年歷史的蘇澳國小！我們的校訂課程「泉鯖亮蘇澳」把冷泉、鯖魚和數位 iPad 學習結合在一起喔！',
    featureSummary: '蘇澳鎮歷史最悠久的百年老校，推動數位學習與「泉鯖亮蘇澳」在地特色課程。',
    landmarkName: '冷泉百歲校門',
    stampTitle: '泉鯖百年章',
    questions: {
      elementary: [
        {
          id: 'sa-e1',
          prompt: '蘇澳冷泉泡起來會感覺冰涼又有很多小氣泡，這是因為水裡含有大量哪一種氣體？',
          options: ['二氧化碳（碳酸氣泡）', '氧氣泡泡', '水蒸氣'],
          answerIndex: 0,
          explanation: '蘇澳冷泉水溫約 22°C，富含二氧化碳，是台灣極少見的低溫碳酸礦泉。',
        },
        {
          id: 'sa-e2',
          prompt: '蘇澳國小特色課程「泉鯖亮蘇澳」中的「鯖」，指的是蘇澳非常有名的哪一種海魚？',
          options: ['鯖魚', '鯨鯊', '吳郭魚'],
          answerIndex: 0,
          explanation: '蘇澳是台灣最重要的鯖魚產地之一，每年還會舉辦熱鬧的鯖魚節！',
        },
      ],
      junior: [
        {
          id: 'sa-j1',
          prompt: '蘇澳冷泉能形成低溫碳酸泉，與當地豐沛雨量及地下哪一種岩石地層交互作用最密切？',
          options: ['石灰岩與板岩裂隙地形', '玄武岩火山熔岩台地', '珊瑚礁沙丘'],
          answerIndex: 0,
          explanation: '豐沛雨水滲入地下深處，與板岩／石灰岩層中的二氧化碳結合並湧出地表，形成約 22°C 冷泉。',
        },
        {
          id: 'sa-j2',
          prompt: '蘇澳冷泉的二氧化碳氣泡在剛下水時常附著在皮膚上，這會造成體感上什麼有趣的變化？',
          options: ['剛入水覺得微涼，幾分鐘後氣泡包覆皮膚反而感覺漸暖', '水溫會突然沸騰到 100°C', '皮膚會完全結霜'],
          answerIndex: 0,
          explanation: '氣泡附著皮膚促進微血管擴張，產生先涼後微暖的獨特體感，這也是冷泉聞名之處。',
        },
      ],
    },
  },
  {
    id: 'suao-jh',
    name: '宜蘭縣立蘇澳國民中學',
    shortName: '蘇澳國中',
    category: 'junior',
    categoryLabel: '國中',
    zone: 'downtown',
    zoneLabel: '冷泉市鎮與白米谷',
    address: '蘇澳鎮中山路二段',
    x: 795,
    y: 735,
    accentColor: '#1D4ED8',
    roofColor: '#4F46E5',
    npcName: '中山探究者',
    npcTitle: '校訂課程領袖',
    greeting: '這裡是位於中山路二段的蘇澳國中！無論是閱讀探究還是生活數學應用，都要靠清晰的邏輯過關。',
    featureSummary: '蘇澳鎮歷史悠久的國中，重視基礎學科、閱讀理解與生活應用特色課程。',
    landmarkName: '悅讀鐘塔廣場',
    stampTitle: '中山探究章',
    questions: {
      elementary: [
        {
          id: 'saj-e1',
          prompt: '在閱讀一篇介紹蘇澳鎮的長文章時，哪一個方法最容易快速掌握重點？',
          options: ['找出每段的主題句並畫出關鍵詞', '只看最後三個字', '把所有標點符號數一遍'],
          answerIndex: 0,
          explanation: '抓出關鍵詞與段落核心，是閱讀理解最重要的基礎能力。',
        },
        {
          id: 'saj-e2',
          prompt: '從蘇澳火車站步行到冷泉公園約 400 公尺，如果每分鐘走 80 公尺，大約需要幾分鐘？',
          options: ['5 分鐘', '15 分鐘', '30 分鐘'],
          answerIndex: 0,
          explanation: '400 ÷ 80 ＝ 5 分鐘，把數學距離算式用在真實散步路線超實用！',
        },
      ],
      junior: [
        {
          id: 'saj-j1',
          prompt: '蘇澳地區若因地形抬升與東北季風產生大量地形雨，從國中地理角度來看，此降水型態好發於哪個季節？',
          options: ['秋冬季節（東北季風迎風坡）', '只有七月乾季', '春季完全無雨'],
          answerIndex: 0,
          explanation: '蘭陽平原與蘇澳位於三面環山、向東開口的地形，秋冬東北季風長驅直入遇到山脈抬升容易降雨。',
        },
        {
          id: 'saj-j2',
          prompt: '校慶園遊會賣蘇澳彈珠汽水，每瓶成本 15 元、售價 25 元，若攤位租金 300 元，至少要賣出幾瓶才會開始賺錢（淨利 > 0）？',
          options: ['31 瓶', '20 瓶', '12 瓶'],
          answerIndex: 0,
          explanation: '每瓶毛利 25 - 15 = 10 元；300 ÷ 10 = 30 瓶打平，所以第 31 瓶起才真正淨賺！',
        },
      ],
    },
  },
  {
    id: 'yongle-es',
    name: '宜蘭縣立永樂國民小學',
    shortName: '永樂國小',
    category: 'elementary',
    categoryLabel: '國小',
    zone: 'downtown',
    zoneLabel: '冷泉市鎮與白米谷',
    address: '蘇澳鎮永樂路',
    x: 450,
    y: 810,
    accentColor: '#975A16',
    roofColor: '#B45309',
    npcName: '木屐師傅',
    npcTitle: '白米山谷守護者',
    greeting: '喀啦喀啦！你聽見木屐走在白米溪谷的聲音嗎？永樂國小依山而建，附近就是著名的白米木屐村與鐵道喔！',
    featureSummary: '位於白米溪谷與永樂里的小型溫馨學校，緊鄰白米木屐文化與礦山鐵道風景。',
    landmarkName: '白米木屐車站',
    stampTitle: '白米木屐章',
    questions: {
      elementary: [
        {
          id: 'yl-e1',
          prompt: '永樂國小所在的白米社區，早期因為出產製造木屐所需的哪一種樹木而成為「木屐村」？',
          options: ['江某樹（白木屐原料）', '仙人掌', '椰子樹'],
          answerIndex: 0,
          explanation: '江某樹質地輕軟、木色潔白，早年是白米社區製作木屐的重要天然木材。',
        },
        {
          id: 'yl-e2',
          prompt: '蘇澳鎮這條深入山谷的支線鐵道與永樂車站，主要連接宜蘭往哪一個方向？',
          options: ['往南連接東澳與花蓮（北迴線）', '往西直接開進台灣海峽', '往南極大陸'],
          answerIndex: 0,
          explanation: '永樂車站是北迴線進入花東縱谷與清水斷崖前的關鍵山谷小站。',
        },
      ],
      junior: [
        {
          id: 'yl-j1',
          prompt: '永樂里一帶過去有豐富的礦產與石灰岩資源，曾帶動水泥工業發展；此類沉積／變質岩主要成分為何？',
          options: ['碳酸鈣（CaCO₃）', '純鐵（Fe）', '氯化鈉（NaCl）'],
          answerIndex: 0,
          explanation: '石灰岩與大理岩主要成分皆為碳酸鈣，除了是水泥原料，也與當地地下炭酸水脈息息相關。',
        },
        {
          id: 'yl-j2',
          prompt: '白米社區從傳統木屐與礦業轉型為「文化觀光與生態體驗」，這種地方創生屬於第幾級產業的加值升級？',
          options: ['六級產業化（一二三級產業融合體驗服務）', '單純採礦輸出', '完全停止任何經濟活動'],
          answerIndex: 0,
          explanation: '結合傳統工藝製造（二級）與觀光體驗故事（三級），創造更有韌性的社區文化價值。',
        },
      ],
    },
  },
  {
    id: 'nanan-es',
    name: '宜蘭縣立南安國民小學',
    shortName: '南安國小',
    category: 'elementary',
    categoryLabel: '國小',
    zone: 'nanfango',
    zoneLabel: '南方澳漁港',
    address: '蘇澳鎮學府路',
    x: 1330,
    y: 820,
    accentColor: '#C05621',
    roofColor: '#EA580C',
    npcName: 'Mia 雙語小導覽',
    npcTitle: '南方澳漁港小主播',
    greeting: 'Welcome to Nan-An! 南安國小推動雙語教育與太鼓管樂，每天都聽得到港口的笛聲與太鼓聲喔！',
    featureSummary: '獲宜蘭縣雙語教育認證，結合太鼓、管樂社團與南方澳漁港人文風景。',
    landmarkName: '雙語港灣音樂台',
    stampTitle: '雙語漁火章',
    questions: {
      elementary: [
        {
          id: 'nae-e1',
          prompt: '南安國小的雙語小導覽員想跟外國遊客介紹「南方澳漁港的魚很新鮮」，哪一句英文最正確？',
          options: ['The fish in Nanfang’ao is very fresh!', 'The fish can fly to the moon.', 'This is a big mountain train.'],
          answerIndex: 0,
          explanation: 'fresh 就是「新鮮的」，用來介紹南方澳現撈海產最適合不過！',
        },
        {
          id: 'nae-e2',
          prompt: '在南安國小社團練習太鼓或管樂合奏時，最需要留意什麼才能讓音樂好聽？',
          options: ['看指揮與聆聽彼此節拍', '每個人自己打自己的速度', '越用力越大聲越好'],
          answerIndex: 0,
          explanation: '合奏講究節奏一致與互相傾聽，才會有震撼人心的樂章！',
        },
      ],
      junior: [
        {
          id: 'nae-j1',
          prompt: '南方澳漁港有許多來自東南亞（如印尼、菲律賓）的漁工朋友，在雙語與多元文化社會中，我們應如何互動？',
          options: ['尊重彼此文化、語言與宗教習慣，友善共融', '因為語言不同就完全不往來', '要求對方只准用一種語言'],
          answerIndex: 0,
          explanation: '南方澳是台灣多元文化共榮的縮影，理解與尊重是公民素養的重要表現。',
        },
        {
          id: 'nae-j2',
          prompt: '若用英文向國際旅客介紹南方澳最知名的漁獲「Mackerel」，它指的是什麼魚？',
          options: ['鯖魚', '鮭魚', '河豚'],
          answerIndex: 0,
          explanation: 'Mackerel 即鯖魚，也是南方澳「鯖魚之鄉」最具代表性的英文單字！',
        },
      ],
    },
  },
  {
    id: 'nanan-jh',
    name: '宜蘭縣立南安國民中學',
    shortName: '南安國中',
    category: 'junior',
    categoryLabel: '國中',
    zone: 'nanfango',
    zoneLabel: '南方澳漁港',
    address: '蘇澳鎮學府路',
    x: 1455,
    y: 845,
    accentColor: '#9C4221',
    roofColor: '#B91C1C',
    npcName: '阿海學姐',
    npcTitle: '內埤海灣觀察員',
    greeting: '從我們南安國中往下看就是超美的內埤海灣與豆腐岬！小班制的校園充滿海風與人情味，一起解開漁村科學題吧！',
    featureSummary: '緊鄰內埤海灣與南方澳漁港的小班制溫馨國中，重視個別關懷與多元才藝發展。',
    landmarkName: '內埤觀海平台',
    stampTitle: '內埤海灣章',
    questions: {
      elementary: [
        {
          id: 'naj-e1',
          prompt: '南安國中旁的「內埤海灘」坡度較陡、容易出現長浪，去海邊觀察時最正確的安全做法是？',
          options: ['在岸上安全區欣賞海景，不貿然下水', '背對海浪站在浪花邊', '颱風天跑去看巨浪'],
          answerIndex: 0,
          explanation: '內埤海灣屬陡降型海灘，常有反捲流與長浪，保持安全距離賞景最重要！',
        },
        {
          id: 'naj-e2',
          prompt: '南方澳共有第一、第二、第三漁港，還有跨港大橋與哪一座著名的媽祖廟信仰中心？',
          options: ['南天宮（金媽祖／玉媽祖）', '行天宮', '鹿港龍山寺'],
          answerIndex: 0,
          explanation: '南方澳南天宮是漁民出海前祈求平安的重要信仰中心。',
        },
      ],
      junior: [
        {
          id: 'naj-j1',
          prompt: '南方澳漁民出海常配合「黑潮」流經台灣東岸捕捉洄游魚類；請問黑潮屬於哪一種性質的海流？',
          options: ['由南向北流的暖流，帶來豐富魚群', '由北極南下的寒流', '完全靜止的淡水湖流'],
          answerIndex: 0,
          explanation: '黑潮為高鹽、高溫且流速強的北向暖流，經過台灣東部海域帶來鯖魚、鰹魚與鬼頭刀等洄游魚群。',
        },
        {
          id: 'naj-j2',
          prompt: '為了讓南方澳漁業永續發展，「責任制漁業」最提倡哪一種捕撈原則？',
          options: ['抓大放小、遵守休漁期與禁用過密網目', '一次把所有小魚苗全抓光', '使用炸魚方式捕撈'],
          answerIndex: 0,
          explanation: '保護幼魚繁殖期與避免混獲，才能年年有魚、維持海洋生態平衡。',
        },
      ],
    },
  },
  {
    id: 'penglai-es',
    name: '宜蘭縣立蓬萊國民小學',
    shortName: '蓬萊國小',
    category: 'elementary',
    categoryLabel: '國小',
    zone: 'dananao',
    zoneLabel: '大南澳山海線',
    address: '蘇澳鎮南澳路',
    x: 1255,
    y: 1185,
    accentColor: '#744210',
    roofColor: '#15803D',
    npcName: '朝陽小山雀',
    npcTitle: '山海步道小隊長',
    greeting: '辛苦翻山越嶺來到大南澳！這裡是朝陽與南強里的蓬萊國小，一面是中央山脈餘脈、一面是太平洋浪花喔！',
    featureSummary: '位於蘇澳南端朝陽／南強里，依山傍海、充滿自然生態與山海鄉土課程。',
    landmarkName: '朝陽山海步道亭',
    stampTitle: '山海蓬萊章',
    questions: {
      elementary: [
        {
          id: 'pl-e1',
          prompt: '蓬萊國小位在蘇澳南邊的大南澳地區（朝陽、南強里），打開教室窗戶就能同時看見什麼景觀？',
          options: ['翠綠山林與太平洋海岸', '高樓摩天大廈群', '沙漠仙人掌'],
          answerIndex: 0,
          explanation: '蓬萊國小依山傍海，走進朝陽國家步道就能俯瞰整個大南澳海灣與漁港！',
        },
        {
          id: 'pl-e2',
          prompt: '在大南澳山海步道健行探索自然生態時，哪一種行為最符合無痕山林（LNT）精神？',
          options: ['自己帶來的垃圾與水壺全部帶下山', '隨手採摘野生蘭花回家', '在樹幹上刻字留念'],
          answerIndex: 0,
          explanation: '不留垃圾、不打擾動植物，才能讓山林與海岸一直保持美麗。',
        },
      ],
      junior: [
        {
          id: 'pl-j1',
          prompt: '從蘇澳市區前往大南澳（蓬萊／朝陽）時，因山勢直逼太平洋形成陡峭海崖，早期公路或現代隧道克服了哪一項地理障礙？',
          options: ['蘇花斷崖地形的交通阻隔', '寬廣平原缺乏石材', '河道過於平坦'],
          answerIndex: 0,
          explanation: '蘇澳至南澳間山海緊逼、斷崖地形險峻，蘇花改隧道大幅提升了居民通學與往返安全。',
        },
        {
          id: 'pl-j2',
          prompt: '朝陽社區近年發展「定置漁網體驗」與「有機咖啡／茶園」，定置漁法相較於底拖網有什麼生態優勢？',
          options: ['不刮除海底棲地，且能挑選放流非目標小魚', '可以把珊瑚礁全部剷平', '需要消耗十倍燃油'],
          answerIndex: 0,
          explanation: '定置漁網屬於被動式守株待兔漁法，對海床環境破壞較小，也能及時釋放不適合捕撈的魚種。',
        },
      ],
    },
  },
];

export const COLLECTIBLES: Collectible[] = [
  {
    id: 'c-bubble-1',
    name: '冷泉氣泡結晶',
    type: 'bubble',
    x: 880,
    y: 660,
    fact: '蘇澳冷泉是世界少數的低溫碳酸礦泉，水溫終年維持在約 22°C。',
  },
  {
    id: 'c-clog-1',
    name: '白米彩繪小木屐',
    type: 'clog',
    x: 565,
    y: 785,
    fact: '白米社區早年利用山谷盛產的江某樹製作木屐，如今成為蘇澳著名工藝。',
  },
  {
    id: 'c-feather-1',
    name: '無尾港水鳥羽',
    type: 'feather',
    x: 1355,
    y: 345,
    fact: '無尾港水鳥保護區每逢秋冬會迎來成群雁鴨與蒼鷺棲息過冬。',
  },
  {
    id: 'c-mackerel-1',
    name: '南方澳鯖魚徽章',
    type: 'mackerel',
    x: 1390,
    y: 800,
    fact: '南方澳是台灣重要的鯖魚產地，「鯖魚祭」融合漁村文化與海洋感謝。',
  },
  {
    id: 'c-shell-1',
    name: '朝陽海灣貝殼',
    type: 'shell',
    x: 1355,
    y: 1165,
    fact: '朝陽漁港旁的朝陽國家步道，是眺望太平洋與烏石鼻海岸的絕佳景點。',
  },
  {
    id: 'c-bubble-2',
    name: '新馬稻浪穀穗',
    type: 'feather',
    x: 925,
    y: 235,
    fact: '蘇澳北端的新馬平原水土豐饒，兼顧稻作農產與食農教育發展。',
  },
];

// Point-in-polygon check for walkable land
export function isPointInLand(px: number, py: number): boolean {
  // Check bridges first
  for (const b of BRIDGES) {
    const minX = Math.min(b.x1, b.x2) - b.width / 2;
    const maxX = Math.max(b.x1, b.x2) + b.width / 2;
    const minY = Math.min(b.y1, b.y2) - 8;
    const maxY = Math.max(b.y1, b.y2) + 8;
    if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
      return true;
    }
  }

  let inside = false;
  for (let i = 0, j = LAND_POLYGON.length - 1; i < LAND_POLYGON.length; j = i++) {
    const [xi, yi] = LAND_POLYGON[i];
    const [xj, yj] = LAND_POLYGON[j];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
