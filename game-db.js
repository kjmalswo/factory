window.GAME_DB = {
  "version": 1,
  "brand": "PORTSIDE",
  "subtitle": "기업 경영 시뮬레이터",
  "startup": {
  "defaultSector": "electronics",
  "defaultFunding": "standard",
  "defaultClimate": "normal",
  "nameLength": 28,
  "funding": {
    "lean": {
      "name": "소자본 창업",
      "cash": 24000000
    },
    "standard": {
      "name": "일반 창업"
    },
    "funded": {
      "name": "투자 유치",
      "cash": 160000000
    }
  },
  "climates": {
    "normal": {
      "name": "평시",
      "event": null
    },
    "boom": {
      "name": "호황",
      "event": "boom"
    },
    "slump": {
      "name": "경기 침체",
      "event": "slump"
    }
  }
},
  "sectors": {
  "electronics": {
    "name": "전자제품",
    "icon": "chip",
    "color": "sage",
    "label": "전자제품 조립",
    "chain": "메모리 칩 → DDR 메모리 모듈",
    "description": "국제 반도체 시세와 납기가 조립 원가를 좌우합니다."
  },
  "furniture": {
    "name": "가구",
    "icon": "chair",
    "color": "amber",
    "label": "가구 제조",
    "chain": "원목 판재 → 업무용 책상",
    "description": "부피가 큰 자재와 긴 가공 시간이 창고와 라인 운영을 좌우합니다.",
    "raw": [
      "wood",
      "hardware",
      "fabric"
    ],
    "products": [
      "desk",
      "chair",
      "sofa"
    ],
    "goods": {
      "wood": {
        "space": 2,
        "name": "건조 원목 판재",
        "short": "원목 판재",
        "base": 31000,
        "supply": 64
      },
      "hardware": {
        "name": "가구용 철물 세트",
        "short": "철물",
        "base": 9000,
        "supply": 55
      },
      "fabric": {
        "name": "내장용 직물 롤",
        "short": "직물",
        "base": 23000,
        "supply": 39
      },
      "desk": {
        "space": 3,
        "name": "업무용 책상",
        "short": "책상",
        "base": 157000,
        "demand": 32,
        "elasticity": 1.3,
        "bom": {
          "wood": 2,
          "hardware": 2
        },
        "work": 1.5,
        "conversion": 15500
      },
      "chair": {
        "space": 2,
        "name": "패브릭 의자",
        "short": "의자",
        "base": 149000,
        "demand": 33,
        "elasticity": 1.5,
        "bom": {
          "wood": 1,
          "hardware": 2,
          "fabric": 1
        },
        "work": 1.5,
        "conversion": 17500,
        "research": 1030000
      },
      "sofa": {
        "space": 5,
        "name": "모듈형 소파",
        "short": "소파",
        "base": 348000,
        "demand": 13,
        "elasticity": 1.8,
        "bom": {
          "wood": 3,
          "hardware": 2,
          "fabric": 3
        },
        "work": 3.5,
        "conversion": 32000,
        "research": 2100000
      }
    },
    "firms": [
      [
        "해성 제재소",
        "건조 목재 가공"
      ],
      [
        "진영 철물",
        "가구용 하드웨어"
      ],
      [
        "대륙 방직",
        "산업 직물 공급"
      ],
      [
        "노바 퍼니처",
        "표준화 · 대량 생산"
      ],
      [
        "한울 리빙",
        "고품질 · 주문 가구"
      ],
      [
        "오비트 디자인",
        "신소재 · 제품 다각화"
      ]
    ],
    "shock": {
      "name": "오피스 재단장 열풍",
      "detail": "업무용 가구 주문과 건조 목재 매입이 급증합니다."
    },
    "freight": 1.65,
    "labels": {
      "officeDesc": "소형 작업실을 겸한 사무실에서 가구 제작과 판재 조달을 시작합니다.",
      "factoryDesc": "재단과 조립, 마감을 처리하는 가구 공장입니다.",
      "office": "사무실·작업실",
      "missionHints": {
        "1": "거래소에서 원목 판재와 철물 세트를 발주하세요.",
        "2": "판재와 철물이 입고되면 생산 관리에서 책상 제작을 지시하세요."
      }
    }
  },
  "foods": {
    "name": "식품",
    "icon": "jar",
    "color": "coral",
    "label": "식품 가공",
    "chain": "곡물 포대 → 곡물 스낵 박스",
    "description": "낮은 단위 마진과 빠른 생산 회전이 현금 흐름을 좌우합니다.",
    "raw": [
      "grain",
      "pack",
      "fruit"
    ],
    "products": [
      "snack",
      "bar",
      "gift"
    ],
    "goods": {
      "grain": {
        "name": "혼합 곡물 포대",
        "short": "곡물",
        "base": 16000,
        "supply": 78
      },
      "pack": {
        "name": "식품 포장재 묶음",
        "short": "포장재",
        "base": 6500,
        "supply": 75
      },
      "fruit": {
        "name": "건조 과일 원료",
        "short": "과일 원료",
        "base": 18500,
        "supply": 39
      },
      "snack": {
        "name": "곡물 스낵 박스",
        "short": "곡물 스낵",
        "base": 48000,
        "demand": 63,
        "elasticity": 0.92,
        "bom": {
          "grain": 1,
          "pack": 1
        },
        "work": 0.5,
        "conversion": 5400
      },
      "bar": {
        "name": "과일 에너지바 박스",
        "short": "에너지바",
        "base": 94000,
        "demand": 39,
        "elasticity": 1.17,
        "bom": {
          "grain": 1,
          "pack": 2,
          "fruit": 1
        },
        "work": 1,
        "conversion": 9800,
        "research": 680000
      },
      "gift": {
        "name": "프리미엄 선물 세트",
        "short": "선물 세트",
        "base": 139000,
        "demand": 20,
        "elasticity": 1.6,
        "bom": {
          "grain": 2,
          "pack": 2,
          "fruit": 2
        },
        "work": 1.5,
        "conversion": 12000,
        "research": 1640000
      }
    },
    "firms": [
      [
        "해성 곡산",
        "곡물 제분 공급"
      ],
      [
        "진영 패키징",
        "식품 포장재"
      ],
      [
        "대륙 농산",
        "과일 건조 가공"
      ],
      [
        "노바 푸드",
        "대량 생산 · 원가 관리"
      ],
      [
        "한울 식품",
        "고품질 · 기능성 식품"
      ],
      [
        "오비트 키친",
        "신상품 · 선물 시장"
      ]
    ],
    "shock": {
      "name": "급식 납품 수요 급증",
      "detail": "대규모 급식 계약으로 곡물 원료와 스낵 주문이 급증합니다."
    },
    "freight": 0.72,
    "labels": {
      "missionSteps": ["사무실 임대","첫 자재 조달","첫 식품 가공","첫 제품 판매","생산 거점 확장","누적 이익 달성"],
      "manufactured": "식품 가공 완료",
      "officeDesc": "소형 식품 작업장을 갖춘 사무실에서 시제품 가공과 도매 거래를 시작합니다.",
      "factoryDesc": "혼합과 가공, 포장 라인을 갖춘 식품 공장입니다.",
      "missionHints": {
        "1": "거래소에서 혼합 곡물과 식품 포장재를 발주하세요.",
        "2": "곡물과 포장재 입고 후 생산 관리에서 곡물 스낵을 지시하세요."
      }
    }
  }
},
  "company": "플레이어 기업",
  "region": "해원항 산업지구",
  "calendar": {"epoch":"2026-01-05T00:00:00Z","dayMs":86400000,"speeds":[3600,1800,900],"speedLabels":["1×","2×","4×"]},
  "finance": {"startingCash":80000000,"loanUnit":20000000,"creditLimit":80000000,"annualInterest":0.074,"year":365,"history":60,"logLimit":120,"goalProfit":20000000},
  "goods": {
    "chip":{"name":"메모리 칩","short":"메모리","base":22000,"supply":60,"volatility":1.35},
    "board":{"name":"인쇄 회로 기판","short":"회로 기판","base":11500,"supply":54,"volatility":0.95},
    "case":{"name":"알루미늄 섀시","short":"섀시","base":8200,"supply":44,"volatility":0.8},
    "ram":{"name":"DDR 메모리 모듈","short":"메모리 모듈","base":98000,"demand":44,"elasticity":1.35,"bom":{"chip":2,"board":1},"work":1,"conversion":6500},
    "ssd":{"name":"산업용 SSD","short":"산업용 SSD","base":151000,"demand":28,"elasticity":1.15,"bom":{"chip":3,"board":1,"case":1},"work":1.5,"conversion":11000,"research":1350000},
    "pc":{"name":"엣지 컴퓨터","short":"엣지 컴퓨터","base":265000,"demand":16,"elasticity":1.45,"bom":{"chip":4,"board":3,"case":2},"work":2.5,"conversion":18500,"research":2650000}
  },
  "raw":["chip","board","case"],"products":["ram","ssd","pc"],
  "sites":[
    {"id":"office","name":"항만 소형 사무실","type":"office","x":13,"y":11,"price":2500000,"daily":42000,"work":4,"dock":8,"storage":100,"zone":"중앙 업무지구"},
    {"id":"works","name":"동부 조립 공장","type":"factory","x":18,"y":11,"price":11500000,"daily":125000,"work":18,"dock":5,"storage":90,"zone":"동부 공업지구"},
    {"id":"store","name":"부두 보세 창고","type":"warehouse","x":18,"y":16,"price":7400000,"daily":68000,"work":0,"dock":26,"storage":440,"zone":"해원 물류단지"},
    {"id":"plot","name":"서부 산업 부지","type":"land","x":8,"y":11,"price":4200000,"daily":18000,"work":0,"dock":0,"storage":0,"zone":"서부 개발구역"},
    {"id":"wharf","name":"남항 물류 터미널","type":"terminal","x":13,"y":20,"price":16900000,"daily":115000,"work":0,"dock":52,"storage":680,"zone":"남항 자유무역구"},
    {"id":"annex","name":"북부 연구 공장","type":"factory","x":18,"y":6,"price":18500000,"daily":157000,"work":26,"dock":10,"storage":130,"zone":"북부 산업단지"},
    {"id":"semicon","name":"해성 반도체","type":"supplier","firm":"hae","x":8,"y":6,"zone":"서부 공업지구"},
    {"id":"pcb","name":"진영 정밀회로","type":"supplier","firm":"jin","x":13,"y":6,"zone":"북부 산업단지"},
    {"id":"metal","name":"대륙 금속","type":"supplier","firm":"dae","x":8,"y":16,"zone":"해원 물류단지"},
    {"id":"nova","name":"노바 일렉트로닉스","type":"rival","firm":"nova","x":23,"y":6,"zone":"동부 공업지구"},
    {"id":"han","name":"한울 시스템","type":"rival","firm":"han","x":23,"y":11,"zone":"동부 공업지구"},
    {"id":"orbit","name":"오비트 테크","type":"rival","firm":"orbit","x":23,"y":16,"zone":"동부 공업지구"}
  ],
  "build":{"price":8400000,"work":15,"storage":80,"dock":6,"daily":88000},
  "trade":{"lots":[5,15,30,60],"fx":1380,"fxPull":0.08,"fxNoise":0.009,"exportPremium":1.16,"exportDemand":0.63,"exportFee":3400,"exportDays":3,"importStock":150,"importOutput":40,"importCost":0.69,"tariff":0.055,"foreignName":"가오슝 무역상사","resaleDiscount":0.78,"contractDiscount":0.86,"wholesaleCoverage":1.25,"contractLead":1,
    "routes":{"road":{"name":"내륙 트럭","days":1,"freight":1600},"express":{"name":"특급 화물","days":1,"freight":6000},"sea":{"name":"해상 수입","days":5,"freight":1050}},
    "crossDock":2,"exportLot":8
  },
  "planning":{"targets":[0,10,30,60],"ceilings":[1,1.2,1.5,2],"initialCeiling":1.2,"routes":["cost","time"]},"operations":{"batch":[2,5,10,20],"lineCost":3200000,"lineWork":6,"dockCost":1800000,"dockGain":8,"maxUpgrade":4,"upgradeDaily":15000,"wipLimit":90,"retailShares":[1,0.5,0],"qualityBase":1,"qualityStep":0.03},
  "market":{"initialStockDays":1.4,"smooth":0.26,"minPrice":0.52,"maxPrice":3.8,"stockDays":1.6,"scarcity":0.7,"minRatio":0.1,"rawDemandMemory":0.28,"initialRawUse":0.88,"priceWeights":[0.85,1,1.15,1.35],"priceSensitivity":3.7,"inertia":0.24,"exposure":0.35,"loyaltyRate":0.12,"retailPressure":0.26,"outsideShare":0.45,"trendPoints":28,"outsidePrice":1,"qualityWeight":1.8},
  "ai":{"cash":47000000,"supplierCash":28000000,"reserve":4000000,"factoryDaily":115000,"mineDaily":75000,"extractionCost":0.48,"stockTarget":4,"maxOrder":40,"dock":55,"storage":650,"strategyDays":6,"switchCost":0.17,"riskPenalty":0.12,"expandCost":5800000,"expandWork":5,"expandCooldown":24,"expandLoad":0.8,"launchCost":980000,"coveragePenalty":0.12,"financeDays":10,"lowCoverage":1.4,"exportRatio":0.35,"launchDays":14,"priceAdjust":0.15,"inventoryTarget":2.6,"minMargin":0.13,"initialInput":20,"initialProduct":12,
    "firms":[
      {"id":"hae","name":"해성 반도체","raw":"chip","capacity":62,"style":"메모리 웨이퍼 가공"},
      {"id":"jin","name":"진영 정밀회로","raw":"board","capacity":53,"style":"기판 전문 공급"},
      {"id":"dae","name":"대륙 금속","raw":"case","capacity":42,"style":"비철금속 정밀 가공"},
      {"id":"nova","name":"노바 일렉트로닉스","product":"ram","capacity":16,"risk":0.72,"quality":0.99,"markup":1.18,"style":"원가 우위 · 대량 생산"},
      {"id":"han","name":"한울 시스템","product":"ssd","capacity":20,"risk":0.43,"quality":1.12,"markup":1.34,"style":"고품질 · 안정 조달"},
      {"id":"orbit","name":"오비트 테크","product":"pc","capacity":18,"risk":0.86,"quality":1.06,"markup":1.25,"style":"신시장 · 제품 다각화"}
    ]},
  "economy":{"interval":[11,21],"first":8,"base":1,"cycleLength":80,"cycleAmplitude":0.08,"foreignVolatility":0.11,
    "events":[
      {"id":"fire","name":"공장 화재","detail":"복구 기간 중 해당 업체의 일일 생산 능력이 감소합니다.","duration":7,"factor":0.18,"weight":3},
      {"id":"shortage","name":"데이터센터 증설","detail":"서버용 메모리 수요가 급증해 시장의 칩 재고를 흡수합니다.","duration":10,"factor":1.85,"drain":34,"weight":4},
      {"id":"glut","name":"공급사 증산","detail":"추가 가동으로 한 공급사의 원자재 출하량이 늘어납니다.","duration":9,"factor":2.2,"weight":4},
      {"id":"boom","name":"설비투자 호황","detail":"기업 고객의 신규 장비 구매가 증가합니다.","duration":13,"factor":1.48,"weight":3},
      {"id":"slump","name":"경기 침체","detail":"구매 연기로 국내외 완제품 주문이 줄어듭니다.","duration":14,"factor":0.67,"weight":3},
      {"id":"crash","name":"신용 경색 · 대공황","detail":"소비와 수출 주문이 급감하고 미판매 재고가 쌓입니다.","duration":19,"factor":0.34,"weight":1}
    ]},
  "map":{"width":37,"height":26,"center":[14,12],"tile":10,"zoom":[1,1.25,1.6,2],"initialZoom":1,"pan":9,"maxFrame":0.045,"renderScale":2,"roadsX":[5,10,15,20,25,30],"roadsY":[3,8,13,18],"waterX":32,"waterY":22,"seed":1948,"railY":2,"labelLift":2.2},
  "ui":{"setupTitle": "회사 설립", "setupEn": "COMPANY REGISTRATION", "setupHint": "회사와 첫 사업 분야를 정하세요.", "companyName": "회사명", "placeholder": "예: 해원산업", "defaultName": "해원산업", "sector": "사업 분야", "funding": "창업 자금", "climate": "초기 경기", "establish": "회사 설립하기", "cancelSetup": "현재 회사로 돌아가기", "setupValidation": "회사명을 입력하세요.", "sitePreview": "창업 예정지", "setupId": "HW / 01", "startRegion": "해원항", "startDistrict": "산업지구", "sectorOverview": "주력 공급망", "startingSite": "첫 사업장", "sectorList": "업종 선택", "previewTitle": "해원항 산업지구", "fundingHint": "자기자본", "namedCompany": "운영 기업", "productGroup": "제조업", "supplyCapacity": "입고량",
    "title":"PORTSIDE | 항만 기업 경영","kicker":"산업 운영 본부","overview":"운영 현황","map":"산업 지도","market":"상품 거래소","production":"생산 관리","logistics":"물류 센터","finance":"재무 장부","firms":"기업 정보","news":"산업 통신","industry":"산업","network":"네트워크","manage":"경영","system":"시스템","download":"실행본 내려받기","save":"저장","saved":"저장됨","saveFail":"기기 저장 공간을 확인하세요.","reset":"새 회사","resetConfirm":"현재 회사를 지우고 처음부터 시작할까요?","credit":"자금","debt":"차입금","income":"누적 순이익","clock":"운영 시계","pause":"일시정지","play":"시간 진행","next":"하루 진행","day":"일차","dayUnit":"일","units":"개","perday":"개/일","money":"원","man":"만","eok":"억","workUnit":"공수/일","warehouseUnit":"칸","capacity":"작업 능력","dock":"하역 능력","storage":"창고 용량","usedStorage":"점유 공간","zone":"권역","daily":"일일 고정비","cost":"취득 비용","lease":"임대 보증금","site":"시설 정보","owned":"자사 시설","available":"입주 가능","partner":"외부 기업","office":"사무실","factory":"공장","warehouse":"창고","land":"산업 부지","terminal":"터미널","supplier":"공급사","rival":"제조사","leaseBtn":"사무실 임대","buy":"시설 확보","build":"조립동 건설","built":"조립동","chooseSite":"지도에서 시설을 선택하세요.","requiresOffice":"먼저 소형 사무실을 임대하세요.","shortCash":"가용 자금이 부족합니다.","duplicate":"이미 확보한 시설입니다.","intro":"소형 사무실을 임대해 첫 조립 라인을 여세요.","mapSub":"해원항 · 대한민국","live":"운영 중","standby":"대기","mapLegend":"시설 범례","pan":"이동","drag":"드래그","zoomIn":"확대","zoomOut":"축소","center":"본사로 이동","close":"닫기","pulse":"시장 동향","pulseSub":"직전 거래일 대비","item":"품목","price":"시장가","change":"등락률","trend":"가격 추이","allMarket":"거래소 열기","feed":"산업 속보","allNews":"전체 기록","status":"운영 진단","exchangeRate":"원/달러","normal":"안정","events":"경기 상황","mission":"경영 목표","missionSteps":["사무실 임대","첫 자재 조달","첫 제품 조립","첫 제품 판매","생산 거점 확장","누적 이익 달성"],"missionHints":["지도에서 소형 사무실의 임대 조건을 확인하세요.","거래소에서 메모리 칩 10개와 회로 기판 5개를 확보하세요.","자재 입고 후 생산 관리에서 메모리 모듈 5개를 지시하세요.","재고에 판매가를 지정하고 하루를 진행하세요.","산업 지도에서 공장을 확보하거나 부지에 조립동을 건설하세요.","가격과 가동률을 조정해 목표 순이익을 달성하세요."],"complete":"목표 달성","inspect":"시설 보기","go":"열기","rawTab":"원자재 조달","productTab":"완제품 판매","amount":"수량","order":"발주","foreign":"해외","local":"국내","import":"수입","tariff":"관세","freight":"운임","landed":"도착 원가","daysTo":"운송 일수","stock":"가용 재고","outOfStock":"공급사 재고가 부족합니다.","input":"보유 자재","research":"제품 개발","queue":"작업 대기열","make":"생산 지시","missing":"필요한 자재가 부족합니다.","queueFull":"작업 대기열 한도에 도달했습니다.","materials":"자재 명세","conversion":"가공비","noJobs":"대기 중인 작업이 없습니다.","line":"라인 증설","dockUpgrade":"하역장 확장","max":"증설 한도에 도달했습니다.","capacityNeed":"공장 또는 조립동이 필요합니다.","needsLand":"먼저 산업 부지를 확보하세요.","locked":"제품 개발이 필요합니다.","invalid":"거래 조건을 다시 확인하세요.","cashflow":"현금 흐름","borrow":"운영자금 대출","repay":"원금 상환","limit":"대출 한도","interest":"연 이율","ledger":"거래 내역","balance":"현금 잔액","amountMoney":"금액","noHistory":"거래가 없습니다.","date":"영업일","description":"항목","sale":"국내 판매","export":"수출","exportBtn":"수출 선적","exportEmpty":"수출할 완제품이 부족합니다.","pricePolicy":"국내 판매가","priceHelp":"시장가 대비 배율로 설정합니다. 국내 판매는 매일 자동 정산됩니다.","margin":"예상 단위 마진","costBasis":"평균 원가","inTransit":"운송 중","shipment":"화물 명세","arrival":"도착 예정","backlog":"하역 대기","noCargo":"운송 중인 화물이 없습니다.","finished":"완제품 재고","reason":"최근 판단","quality":"품질 지수","cash":"보유 현금","activeProduct":"주력 품목","capacityShort":"생산 능력","firmIntro":"업체별 조달과 재고, 판매가가 매일 시장에서 경쟁합니다.","initialReason":"초기 거래망 확보","supplyReason":"재고와 자금에 맞춰 출하","switchReason":"예상 마진·경쟁 강도에 따라 주력 품목 변경","investReason":"가동률 상승에 대응해 조립 라인 증설","launchReason":"개발비 집행 후 신규 제품 출시","waitReason":"운영자금 보전을 위해 발주 축소","orderReason":"판매 속도와 납기 기준으로 안전재고 확보","reduceReason":"재고 누적으로 생산 감축","initialNews":"해원항 거래소 개장","initialDetail":"소재 공급사와 제조사가 거래를 시작했습니다.","typeMarket":"시장","typeCompany":"기업","typeOps":"운영","leased":"사무실 임대 계약","acquired":"시설 매입","builtNews":"조립동 준공","purchased":"자재 발주","delivered":"화물 입고","manufactured":"제품 조립 완료","upgrade":"설비 투자","expenses":"임차료·설비 유지비","interestPaid":"차입 이자","insolvent":"지급 불능","failedHelp":"현금과 남은 신용 한도로 운영비를 충당할 수 없습니다.","autoLoan":"긴급 운영자금 차입","shipped":"수출 대금 회수","sold":"국내 판매 정산","marketRecovery":"시장 충격 종료","route":"운송 경로","working":"작업 진행","spaceBlock":"창고 포화","inputBlock":"자재 부족","idle":"생산 대기","loaded":"생산 진행","portBlock":"하역 적체","daysLeft":"잔여 일수","unitPrice":"자재 단가","total":"발주 총액","priceIndex":"시장 가격 지수","priceIndexHelp":"원자재·완제품 기준가 평균","volume":"전일 판매","business":"영업 현황","emptyFeed":"기록이 없습니다.","journal":"산업 일지","filterAll":"전체","assets":"운영 자산","facilityCount":"보유 시설","speed":"진행 속도","costHelp":"자재와 가공비는 생산 지시 시 투입합니다.","spaceHelp":"입고 대기 화물은 다음 영업일에 다시 하역합니다.","storageBusy":"창고에 완제품을 보관할 공간이 부족합니다.","exportPrice":"수출 단가","exportHelp":"해외 수요 한도 내에서 선적하고 운송 완료 시 대금을 회수합니다.","exportLimit":"해외 잔여 수요","creditHelp":"운영비 결제 시 잔여 신용 한도에서 자동 차입합니다.","target":"목표 순이익","ready":"개발 완료","sku":"생산 품목","progress":"잔여 작업","firmLink":"기업 장부 보기","lineCount":"라인 증설 횟수","dockCount":"하역장 확장 횟수","logisticsHelp":"발주처의 거리·운송 방식과 보유 시설의 일일 하역 한도가 입고일을 결정합니다.","mapTitle":"해원항 산업 지도","ticker":"원자재 시세","workspace":"운영 콘솔","overviewEn":"OPERATIONS OVERVIEW","dayTag":"DAY","mapTag":"DISTRICT MAP","marketTag":"MARKET WATCH","feedTag":"INDUSTRY WIRE","inspectorTag":"PROPERTY","goalTag":"MILESTONE","mapCode":"HW · 01","regionEn":"HAEWON INDUSTRIAL PORT","systemOnline":"시스템 연결됨","overviewHint":"산업 지도와 거래 현황","companyTag":"PORTSIDE INDUSTRIES","landUse":"시설 용도","selected":"선택","marketSummary":"시장 지수","notTrading":"거래 대기","downloadFail":"실행본을 생성할 수 없습니다. HTTP 서버에서 다시 시도하세요.","currency":"₩","exportRoute":"해원항 → 해외 바이어","source":"출발지","profitHelp":"판매원가와 일일 운영비를 반영합니다.","navigation":"메뉴","more":"자세히","holding":"보유량","queueAhead":"예상 입고","goalTip":"단계별 경영 과제","officeDesc":"소규모 전자제품 조립과 국내외 자재 거래를 시작할 수 있습니다.","factoryDesc":"조립 라인과 자재 보관 공간을 갖춘 생산 시설입니다.","warehouseDesc":"입고 처리량과 재고 보관 공간을 늘립니다.","landDesc":"매입 후 조립동을 건설할 수 있는 산업용 부지입니다.","terminalDesc":"대량 수입 화물의 하역과 보관에 적합합니다.","supplierDesc":"원자재를 생산해 해원항 시장에 공급합니다.","rivalDesc":"같은 시장에서 자재를 구매하고 완제품을 판매합니다.","est":"거래소 기준","stockUnit":"개","officeId":"HW–01","siteIdPrefix":"HW–","localRoute":"항만 내륙망","mapCoords":"항만 좌표","officeMark":"P","supplierMark":"S","rivalMark":"C","availableMark":"+","selectedMark":"◆","notStarted":"입주 전","note":"거래 메모","taxAmount":"수입 관세","rate":"판매 배율","supply":"공급량","demand":"수요량","dayPrefix":"D","pauseLabel":"정지","finishState":"경영 목표를 모두 달성했습니다.","mobileMenu":"메뉴 열기","bankruptMsg":"운영 종료","rawSpend":"자재 매입","fixed":"고정비","marketing":"판매 현황","productionHelp":"작업은 지시 순서대로 진행됩니다.","arrivalWork":"입고 처리","marketLead":"거래처와 운송 방식을 선택해 실제 도착 원가를 비교하세요.","chipIcon":"IC","ssdIcon":"SSD","pcIcon":"PC","ramIcon":"DDR","boardIcon":"PCB","caseIcon":"AL","welcome":"입주를 시작하세요","noStocks":"보유 중인 재고가 없습니다.","zoom":"지도 배율","pending":"대기","saleMargin":"매출총이익","marketDemand":"전일 구매 수요","full":"창고 부족","mapUnit":"블록","tickerSeparator":"·","minus":"−","plus":"+","goalPosition":"현재 단계","newsTime":"영업일","compactLocale":"ko-KR","sceneCode":"HW / PORT","cashShort":"가용 현금","goalNav":["map","market","production","market","map","finance"],"planning":"운영 계획","repeatTitle":"반복 생산","repeatHelp":"영업일마다 자재와 라인 여유를 확인해 선택한 배치를 한 번 투입합니다.","disabled":"사용 안 함","replenish":"자동 자재 조달","replenishHelp":"보유량과 입고 예정량의 합이 목표보다 낮으면 운임·관세 포함 상한가 안에서 발주합니다.","targetStock":"목표 재고","ceiling":"도착 원가 상한","costPriority":"최저 원가 우선","timePriority":"최단 납기 우선","reference":"기준가","dailyBatch":"일일 배치","autofill":"자동 발주","planOn":"반복 생산 중","pickSite":"지도 시설 선택","shareTitle":"국내 소매 배정","shareLabels":["전량 소매 판매","절반 소매 판매","수출·납품용 보관"],"shareHelp":"남은 물량은 재고로 보관하며 수출하거나 다른 제조사에 납품할 수 있습니다.","contract":"기업 간 납품","buyer":"납품처","contractLimit":"추가 매입 의향","contractUnit":"계약 단가","contractBtn":"납품 계약","contractHelp":"상대 기업의 예상 판매량, 도착 예정 재고, 운영자금에 따라 구매 한도가 달라집니다.","buyback":"공급사에 재판매","buybackHelp":"창고에 남은 원자재를 국내 공급사에 되팔아 공간을 확보합니다.","resaleUnit":"재매입 단가","buybackLimit":"재매입 한도","loading":"수출 하역 대기","readyShip":"선적","retired":"영업 중단","restructure":"재무 구조조정","insolvencyDetail":"지급 불능으로 신규 발주와 생산을 중단했습니다. 기존 재고와 미수금은 정산됩니다.","noBuyer":"구매 가능 수량을 초과했습니다.","unitSpace":"개당 적재 공간","sourceName":"Portside","downloadName":"portside.html","fileName":"PORTSIDE","keyHint":"W A S D","tickerEmpty":"거래소 개장","noDebt":"상환할 차입금이 없습니다.","unitCost":"개당 원가","supplierStatus":"공급 현황","buildReady":"건설 가능","viewMap":"지도 보기","eventsUntil":"종료 예정","warehouseHint":"재고 · 가공 중 제외","dailyDemand":"예상 일일 수요","firmChoice":"기업 선택","navGroups":[["overview","map","market"],["production","logistics","finance"],["firms","news"]],"groupNames":["워크스페이스","기업 운영","산업 네트워크"],"navEnglish":{"map":"DISTRICT MAP","market":"COMMODITY EXCHANGE","production":"PRODUCTION CONTROL","logistics":"PORT LOGISTICS","finance":"FINANCIAL LEDGER","firms":"CORPORATE NETWORK","news":"INDUSTRY WIRE"}}
};
