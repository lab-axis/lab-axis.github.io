# Lab AXIS 연구실 홈페이지

수원대학교 컴퓨터공학부 Lab AXIS 공식 홈페이지 소스입니다.
**빌드 도구가 없습니다.** HTML·CSS·JS 파일을 그대로 GitHub Pages가 서빙합니다.
Node.js, npm, Jekyll 설치가 필요 없습니다.

---

## 1. 폴더 구조

```
lab-axis.github.io/
├── index.html            홈
├── members.html          구성원 (지도교수는 요약 카드만)
├── faculty.html          지도교수 상세 이력 — members.html 의 "See detail →" 로 연결
├── publications.html     논문
├── research.html         진행 중인 연구 프로젝트
├── news.html             소식
├── contact.html          오시는 길
├── 404.html              없는 페이지
│
├── data/                 ★ 내용을 고칠 때 대부분 여기만 만지면 됩니다
│   ├── people.json         지도교수 · 학생 · 협력 연구자
│   ├── topic.json          연구 분야 (홈의 Research Topic 섹션)
│   ├── research.json       투고 중 · 진행 중 프로젝트 (research.html)
│   ├── publications.json   게재된 논문
│   └── news.json           연구실 소식
│
├── assets/
│   ├── css/style.css       모든 디자인 (색상·글꼴·간격)
│   ├── js/site.js          헤더/푸터 생성, 언어 전환, JSON 렌더링
│   └── img/
│       ├── favicon.svg     브라우저 탭 아이콘
│       ├── people/         구성원 사진 (placeholder.svg 포함)
│       └── news/           행사 사진
│
├── .nojekyll             GitHub Pages가 Jekyll 처리를 건너뛰도록 함
└── README.md             이 문서
```

핵심 원칙: **내용은 `data/`, 디자인은 `assets/css/style.css`, 동작은 `assets/js/site.js`.**\
페이지 HTML에는 제목과 문단 정도만 들어 있고, 목록은 전부 JSON에서 자동으로 만들어집니다.

---

## 1-b. 화면과 데이터의 연결 관계

HTML의 `data-render` 속성이 "여기에 무엇을 그릴지"를 지정합니다.
`data-source` 가 있으면 그 이름의 JSON을, 없으면 `data-render` 와 같은 이름의 JSON을 읽습니다.

| `data-render` | 읽는 파일 | 그리는 내용                    | 쓰이는 곳 |
|---|---|---------------------------|---|
| `topic` | `topic.json` | 연구 주제                     | index.html |
| `research` | `research.json` | 프로젝트 목록                   | research.html |
| `publications` | `publications.json` | 논문 목록                     | publications.html |
| `news` | `news.json` | 소식 + 사진 갤러리               | news.html |
| `facultyBrief` | `people.json` | 지도교수 요약 카드                | members.html |
| `faculty` | `people.json` | 지도교수 상세 이력                | faculty.html |
| `awards` | `people.json` | 수상 이력                     | faculty.html |
| `students` | `people.json` | 학생 카드 (`data-group` 으로 필터) | members.html |
| `collaborators` | `people.json` | 산업계 협력 연구자                | faculty.html |

**보조 속성**

| 속성 | 뜻 | 예 |
|---|---|---|
| `data-source="people"` | 읽을 JSON 파일을 따로 지정 | `data-render="faculty" data-source="people"` |
| `data-limit="4"` | 앞에서 N개만 표시 | 홈의 최근 소식 |
| `data-group="bsc"` | 학생 그룹 필터 | phd / msc / bsc / alumni |
| `data-set-title="true"` | 브라우저 탭 제목을 이름으로 교체 | faculty.html |
| `data-images="false"` | 뉴스에서 사진을 감춤 | 홈 요약용 |
| `<body data-nav="members.html">` | 헤더에서 활성화할 메뉴 지정 | faculty.html |

---

## 2. 자주 하는 작업

### 2-1. 구성원 추가하기

`data/people.json` 의 `students` 배열에 항목을 하나 복사해 붙여 넣고 값만 바꾸세요.

```json
{
  "name": { "en": "Gildong Hong", "ko": "홍길동" },
  "group": "bsc",
  "role": { "en": "BSc student in Computer Science", "ko": "컴퓨터공학부 학부연구생" },
  "topic": { "en": "Research topic in English", "ko": "연구 주제" },
  "photo": "assets/img/people/gildong-hong.jpg"
}
```

- `group` 값에 따라 표시되는 위치가 정해집니다.
  `phd` = 박사과정 / `msc` = 석사과정 / `bsc` = 학부연구생 / `alumni` = 졸업생
- **졸업하면** `group` 을 `"alumni"` 로 바꾸기만 하면 자동으로 졸업생 칸으로 이동합니다.
- 사진은 `assets/img/people/` 에 넣고 경로 수정합니다.
- 파일명은 **영문 소문자·하이픈**으로 (`gildong-hong.jpg`). 공백·한글·대문자는 금지입니다.
- 사진 규격: **증명사진 7:9 비율**(권장 700×900px), JPG, 500KB 이하.

```bash
# 7:9 로 자르고 EXIF 제거 (얼굴이 위쪽이므로 north 기준으로 크롭)
magick input.jpg -strip -resize 700x900^ -gravity north -extent 700x900 -quality 82 assets/img/people/gildong-hong.jpg
```

- 얼굴 사진은 **당사자 동의**를 받고 올리세요. 졸업 후 삭제를 요청하면 `photo` 줄과 파일을 지웁니다.
  `photo` 줄이 없으면 회색 기본 이미지가 나오므로 레이아웃은 깨지지 않습니다.

### 2-1-b. 지도교수님 정보 고치기

지도교수는 `data/people.json` 의 `faculty` 배열에 있습니다. 화면에 두 가지 형태로 나옵니다.

| 위치 | 보이는 항목 |
|---|---|
| `members.html` 요약 카드 | `photo` · `name` · `title` · `tagline` · `email` + "See detail →" 링크 |
| `faculty.html` 상세 페이지 | 위 항목 + `bio` · `education` · `interests` · `awards` · `links` |

- `tagline` 은 요약 카드에만 나오는 두세 줄짜리 소개입니다. 길게 쓰면 카드가 늘어지니 짧게 유지하세요.
- `bio` 는 긴 소개입니다. 문단을 나누려면 **빈 줄 두 개**(`\n\n`)를 넣으세요.
- 교수가 늘어나면 `faculty` 배열에 항목을 추가하기만 하면 됩니다. 요약 카드가 자동으로 하나 더 생기고,
  각 카드는 `faculty.html?id=<id>` 로 연결됩니다. `id` 는 영문 소문자·하이픈으로 **중복 없이** 지정하세요.

### 2-2. 논문 추가하기

`data/publications.json` 의 `publications` 배열 **맨 앞**에 추가하세요 (표시 순서 = 배열 순서).

```json
{
  "title": "논문 제목",
  "authors": "First Author, Second Author, and Third Author",
  "venue": "Journal Name, 15(2), 12345",
  "year": 2026,
  "tag": "SCIE Q1",
  "url": "https://doi.org/..."
}
```

`tag` 는 초록색 배지로 표시됩니다. 필요 없으면 그 줄을 지우세요.

### 2-3. 소식 추가하기

`data/news.json` 의 `news` 배열에 추가합니다. **위치는 아무 데나 상관없습니다** — 날짜 기준으로 자동 정렬됩니다.

```json
{
  "date": "2026-09",
  "title": { "en": "Title in English", "ko": "한국어 제목" },
  "body":  { "en": "One or two sentences.", "ko": "한두 문장." },
  "people": { "en": "Gildong Hong, Chulsoo Kim", "ko": "홍길동, 김철수" },
  "links": [ { "label": { "en": "Related news", "ko": "관련 기사" }, "url": "https://..." } ],
  "images": [
    { "src": "assets/img/news/2026-09-workshop-1.jpg",
      "caption": { "en": "Caption in English", "ko": "한국어 설명" } },
    { "src": "assets/img/news/2026-09-workshop-2.jpg" }
  ]
}
```

- `date` 는 반드시 `"YYYY-MM"` 형식(예: `"2026-09"`)으로 씁니다.
- `people`, `links`, `images` 는 필요 없으면 통째로 지워도 됩니다.
- `caption` 도 선택입니다. 없으면 사진 아래에 아무것도 표시되지 않습니다.

### 2-3-b. 행사 사진 등록 규칙

사진 비율이 제각각이어도 화면에서는 **3:2 썸네일**로 잘려 격자로 정렬되고,
클릭하면 원본 전체가 확대되어 보입니다. 그래서 비율은 신경 쓰지 않아도 되지만,
**파일명과 용량은 반드시 규칙을 지켜주세요.**

**파일명** — `YYYY-MM-슬러그-번호.jpg`

```
2026-07-icml-1.jpg
2026-05-jinan-1.jpg   2026-05-jinan-2.jpg   2026-05-jinan-3.jpg
2025-12-autonomous-driving-1.jpg
```

- 앞의 `YYYY-MM` 은 `news.json` 의 `date` 와 똑같이 맞춥니다. 폴더를 열면 시간순으로 정렬되고,
  나중에 어느 뉴스의 사진인지 파일명만 보고 알 수 있습니다.
- **영문 소문자·숫자·하이픈만** 사용하세요. 공백·한글·대문자는 금지입니다.
  GitHub Pages는 대소문자를 구분하고, 공백은 URL에서 `%20` 으로 깨집니다.
- 같은 행사 사진이 여러 장이면 뒤에 `-1`, `-2`, `-3` 을 붙입니다. 화면에는 해당 순서대로 나옵니다.

**포맷과 용량**

| 항목 | 기준 |
|---|---|
| 형식 | 사진은 `.jpg` (도표·스크린샷처럼 글자가 많으면 `.png`) |
| 최대 가로 | 1600px |
| 파일당 용량 | 200KB 이하 권장, 최대 500KB |
| 메타데이터 | EXIF 제거 필수 (스마트폰 사진에는 **촬영 위치 GPS**가 들어 있습니다) |

[//]: # (**변환 명령어** — 원본을 `raw/` 에 두고 아래를 실행하면 규칙에 맞게 한 번에 처리됩니다.)

[//]: # ()
[//]: # (```bash)

[//]: # (# ImageMagick 한 장)

[//]: # (magick raw/photo.jpg -strip -resize 1600x1600\> -quality 82 assets/img/news/2026-09-workshop-1.jpg)

[//]: # ()
[//]: # (# 폴더 전체 &#40;Python + Pillow&#41;)

[//]: # (python -c ")

[//]: # (from PIL import Image; import glob, os)

[//]: # (for i, f in enumerate&#40;sorted&#40;glob.glob&#40;'raw/*'&#41;&#41;, 1&#41;:)

[//]: # (    im = Image.open&#40;f&#41;.convert&#40;'RGB'&#41;)

[//]: # (    if im.width > 1600: im = im.resize&#40;&#40;1600, round&#40;im.height*1600/im.width&#41;&#41;, Image.LANCZOS&#41;)

[//]: # (    im.save&#40;f'assets/img/news/2026-09-workshop-{i}.jpg', quality=82, optimize=True&#41;)

[//]: # (")

[//]: # (```)

[//]: # ()
[//]: # (`-strip` 과 Pillow 의 재저장 모두 EXIF를 제거합니다. 변환 후 원본은 저장소에 넣지 마세요.)

**사진 게시 전 확인**

- 얼굴이 나오는 사진은 **당사자 동의**를 받으세요. 단체 사진도 마찬가지입니다.
- 졸업생·퇴사자가 삭제를 요청하면 해당 `images` 항목과 파일을 지웁니다. (`placeholder.svg`로 대체됩니다.)
- 화이트보드·모니터에 미공개 연구 내용이 찍히지 않았는지 확인하세요.

### 2-4. 프로젝트 추가 / 논문 게재 시 이동

투고 중인 연구는 `data/research.json` 에, 게재가 확정되면 `data/publications.json` 으로 옮기고
`research.json` 에서는 해당 항목을 지우면 됩니다.

`research.json` 은 **원문(영문) 단일 언어**로 관리합니다. 논문 제목·저자·게재지는 원문이 곧 정식 표기이므로
`{ "en": ..., "ko": ... }` 로 나누지 말고 문자열 하나만 적으세요.

```json
{
  "title": "Paper or project title",
  "collaborators": [
    { "name": "Prof. Someone", "affiliation": "Some University", "url": "https://..." }
  ],
  "status": "Submitted to Journal Name (SCIE Q1)"
}
```

### 2-5. 메뉴 추가 / 이름 변경

`assets/js/site.js` 파일 맨 위의 `NAV` 배열만 고치면 모든 페이지의 헤더가 한 번에 바뀝니다.

```js
var NAV = [
  { href: 'index.html', en: 'Home', ko: '홈' },
  ...
];
```

### 2-6. 색상 · 글꼴 바꾸기

`assets/css/style.css` 맨 위 `:root` 블록의 변수만 고치세요. 사이트 전체에 동기화됩니다.

```css
--accent:        #0F6E56;   /* 강조색 (링크, 배지, 활성 메뉴) */
--accent-bright: #1D9E75;   /* 밑줄, 구분 강조 */
--ink:           #141412;   /* 제목 글자색 */
```

---

## 5. 언어 전환 규칙

사이트 기본 언어는 영어이고, 헤더 우측 `EN / KO` 버튼으로 전환됩니다. 선택은 브라우저에 기억됩니다.

- **JSON 안에서**: `{ "en": "...", "ko": "..." }` 형태로 두 언어를 적습니다.
- **HTML 안에서**: `<span data-lang="en">English</span><span data-lang="ko">한국어</span>` 로 나란히 적습니다.
- 논문 제목·저자·학술지명, 그리고 `research.json` 전체는 원문(영문)이므로 번역하지 않습니다.

> ⚠️ **`data-lang` 은 번역 텍스트에만 쓰세요.**
> CSS가 `data-lang` 이 붙은 요소 중 현재 언어와 다른 것을 **화면에서 숨깁니다.**
> 번역이 아닌 요소(버튼·아이콘 등)에 붙이면 그 요소 자체가 사라집니다.
> 실제로 언어 전환 버튼에 `data-lang` 을 썼다가 버튼이 사라지는 문제가 있었고,
> 지금은 `data-set-lang` 이라는 별도 속성을 쓰도록 고쳤습니다.

### 한국어를 안 쓰는 항목

아래는 의도적으로 단일 언어입니다. `{en, ko}` 로 나누지 마세요.

| 항목 | 이유 |
|---|---|
| `publications.json` 전체 | 논문 서지정보는 원문이 정식 표기 |
| `research.json` 전체 | 논문 투고 제목이므로 위와 동일 |
| `people.json` 의 `email`, `photo`, `group`, `id` | 번역 대상이 아닌 값 |

