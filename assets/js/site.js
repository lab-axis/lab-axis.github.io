(function () {
  'use strict';

  /* ---------------- Navigate Menu ---------------- */
  var NAV = [
    { href: 'index.html',        en: 'Home',         ko: '홈' },
    { href: 'members.html',      en: 'Members',      ko: '구성원' },
    { href: 'publications.html', en: 'Publications', ko: '논문' },
    { href: 'research.html',     en: 'Research',     ko: '연구' },
    { href: 'news.html',         en: 'News',         ko: '소식' },
    { href: 'contact.html',      en: 'Contact',      ko: '오시는 길' }
  ];

  /* ---------------- Language ---------------- */
  var LANG_KEY = 'axis-lang';
  var lang = 'en';

  function initLang() {
    var saved = null;
    try { saved = window.localStorage.getItem(LANG_KEY); } catch (e) { /* private mode */ }
    lang = (saved === 'ko' || saved === 'en') ? saved : 'en';
    document.documentElement.lang = lang;
  }

  function setLang(next) {
    lang = next;
    document.documentElement.lang = next;
    try { window.localStorage.setItem(LANG_KEY, next); } catch (e) { /* ignore */ }
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setLang === next));
    });
    render();
  }

  /* t(value) : {en:"...", ko:"..."} 또는 문자열을 현재 언어로 반환 */
  function t(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    return v[lang] || v.en || v.ko || '';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  
  function link(href, label) {
    if (!href) return esc(label);
    var ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' + esc(href) + '"' + ext + '>' + esc(label) + '</a>';
  }

  /* ---------------- Header / Putter ---------------- */
  /* 현재 페이지 파일명. 상세 페이지에서 상위 메뉴를 활성화하고 싶으면
     <body data-nav="members.html"> 처럼 지정 */
  function currentPage() {
    var override = document.body && document.body.dataset.nav;
    if (override) return override;
    var f = location.pathname.split('/').pop();
    return (!f || f === '') ? 'index.html' : f;
  }

  function buildChrome() {
    var here = currentPage();

    var navHTML = NAV.map(function (i) {
      var cur = (i.href === here) ? ' aria-current="page"' : '';
      return '<a href="' + i.href + '"' + cur + '>' +
             '<span data-lang="en">' + i.en + '</span>' +
             '<span data-lang="ko">' + i.ko + '</span></a>';
    }).join('');

    var header = document.querySelector('[data-site-header]');
    if (header) {
      header.className = 'site-header';
      header.innerHTML =
        '<div class="bar">' +
          '<a class="brand" href="index.html">' +
            '<span class="name" style="font-size: 24px">LAB AXIS</span>' +
          '</a>' +
          '<button class="nav-toggle" type="button" aria-expanded="false" aria-label="Menu">☰</button>' +
          '<nav class="nav" id="site-nav">' + navHTML + '</nav>' +
          '<div class="lang-toggle" role="group" aria-label="Language">' +
            '<button type="button" data-set-lang="en">EN</button>' +
            '<button type="button" data-set-lang="ko">KO</button>' +
          '</div>' +
        '</div>';

      header.querySelector('.nav-toggle').addEventListener('click', function () {
        var nav = header.querySelector('.nav');
        var open = nav.classList.toggle('open');
        this.setAttribute('aria-expanded', String(open));
      });
      header.querySelectorAll('.lang-toggle button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.setLang === lang));
        b.addEventListener('click', function () { setLang(b.dataset.setLang); });
      });
    }

    var footer = document.querySelector('[data-site-footer]');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML =
        '<div class="inner">' +
          '<div>' +
            '<div class="f-name">LAB AXIS</div>' +
            '<p data-lang="en">Department of Computer Science, University of Suwon<br>' +
              'Room 207, College of IT · 17 Wau-an-gil, Bongdam-eup, Hwaseong-si, Gyeonggi-do, Republic of Korea</p>' +
            '<p data-lang="ko">수원대학교 컴퓨터공학부<br>' +
              '경기도 화성시 봉담읍 와우안길 17 수원대학교 IT대학 207호</p>' +
            '<p><a href="mailto:seongil.han@suwon.ac.kr">seongil.han@suwon.ac.kr</a></p>' +
          '</div>' +
          '<div class="f-links">' +
            '<a href="members.html"><span data-lang="en">Members</span><span data-lang="ko">멤버</span></a>' +
            '<a href="publications.html"><span data-lang="en">Publications</span><span data-lang="ko">논문</span></a>' +
            '<a href="research.html"><span data-lang="en">Research</span><span data-lang="ko">연구</span></a>' +
            '<a href="contact.html"><span data-lang="en">Contact</span><span data-lang="ko">오시는 길</span></a>' +
          '</div>' +
        '</div>';
    }
  }

  /* ---------------- 데이터 로딩 ---------------- */
  var cache = {};
  function load(name) {
    if (cache[name]) return cache[name];
    cache[name] = fetch('data/' + name + '.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error(name + '.json: HTTP ' + r.status);
        return r.json();
      })
      .catch(function (err) {
        console.error('[Lab AXIS] 데이터를 불러오지 못했습니다 —', err.message);
        return null;
      });
    return cache[name];
  }

  /* ---------------- Renderer ---------------- */
  /* 페이지의 <div data-render="이름"> 요소를 찾아 아래 함수로 내용을 채윰 */
  var renderers = {

    /* Research Topic — data/topic.json 의 areas (홈의 Research Topic 섹션) */
    topic: function (el, d) {
      if (!d) return;
      var n = parseInt(el.dataset.limit || '0', 10);
      var items = n ? d.areas.slice(0, n) : d.areas;
      el.innerHTML = items.map(function (a, i) {
        return '<article class="numbered">' +
               '<div class="idx">' + String(i + 1).padStart(2, '0') + '</div>' +
               '<h3>' + esc(t(a.title)) + '</h3>' +
               '<p>' + esc(t(a.description)) + '</p>' +
               '</article>';
      }).join('');
    },

    /* 지도교수 요약 카드 (members.html) — 상세는 faculty.html 로 연결 */
    facultyBrief: function (el, d) {
      if (!d) return;
      el.innerHTML = (d.faculty || []).map(function (f) {
        var href = 'faculty.html' + (f.id ? '?id=' + encodeURIComponent(f.id) : '');
        return '<article class="faculty-brief">' +
          '<a href="' + href + '" aria-label="' + esc(t(f.name)) + '">' +
            '<img class="photo" src="' + esc(f.photo || 'assets/img/people/placeholder.svg') + '"' +
            ' alt="' + esc(t(f.name)) + '" loading="lazy"' +
            ' onerror="this.src=\'assets/img/people/placeholder.svg\'"></a>' +
          '<div>' +
            '<h3><a href="' + href + '">' + esc(t(f.name)) + '</a>' +
              '<a class="see-detail" href="' + href + '">' +
                '<span data-lang="en">See detail →</span>' +
                '<span data-lang="ko">상세 이력 보기 →</span></a>' +
            '</h3>' +
            '<div class="affil">' + esc(t(f.title)) + '</div>' +
            (f.tagline ? '<p class="brief-line">' + esc(t(f.tagline)) + '</p>' : '') +
            '<div class="affil"><a href="mailto:' + esc(f.email) + '">' + esc(f.email) + '</a></div>' +
          '</div>' +
        '</article>';
      }).join('');
    },

    /* 지도교수 전체 프로필 (faculty.html) */
    faculty: function (el, d) {
      if (!d || !d.faculty || !d.faculty.length) return;
      var want = new URLSearchParams(location.search).get('id');
      var f = (want && d.faculty.filter(function (x) { return x.id === want; })[0]) || d.faculty[0];
      if (!f) return;
      if (el.dataset.setTitle === 'true') document.title = t(f.name) + ' — Lab AXIS';
      var edu = (f.education || []).map(function (e) {
        return '<li class="degree"><div class="d-title">' + esc(t(e.degree)) + '</div>' +
               '<div class="d-meta">' + esc(t(e.institution)) +
               (e.thesis ? '<br> Thesis: ' + esc(t(e.thesis)) : '') +
               (e.supervisor ? '<br> Supervisor: ' + (e.supervisorUrl ? link(e.supervisorUrl, t(e.supervisor)) : esc(t(e.supervisor))) : '') +
               '</div></li>';
      }).join('');
      var interests = (f.interests || []).map(function (a) { return '<li>' + esc(t(a)) + '</li>'; }).join('');
      var links = (f.links || []).map(function (l) { return link(l.url, l.label); }).join(' · ');

      el.innerHTML =
        '<div class="faculty">' +
          '<div><img class="photo" src="' + esc(f.photo) + '" alt="' + esc(t(f.name)) + '"' +
            ' onerror="this.style.visibility=\'hidden\'"></div>' +
          '<div>' +
            '<h2>' + esc(t(f.name)) + '</h2>' +
            '<div class="affil">' + esc(t(f.title)) + '</div>' +
            '<div class="affil">' + esc(t(f.office)) + '</div>' +
            '<div class="affil"><a href="mailto:' + esc(f.email) + '">' + esc(f.email) + '</a>' +
              (links ? ' · ' + links : '') + '</div>' +
            '<div class="bio-block" style="margin-top:26px;">' +
              '<h3>Biography</h3>' +
              (t(f.bio) || '').split('\n\n').map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
            '</div>' +
            (edu ? '<div class="bio-block"><h3>Education</h3><ul>' + edu + '</ul></div>' : '') +
            (interests ? '<div class="bio-block"><h3>Research interests</h3><ul>' + interests + '</ul></div>' : '') +
          '</div>' +
        '</div>';
    },

    /* 수상 · 경력 (faculty.html 의 별도 섹션) */
    awards: function (el, d) {
      if (!d || !d.faculty || !d.faculty.length) return;
      var want = new URLSearchParams(location.search).get('id');
      var f = (want && d.faculty.filter(function (x) { return x.id === want; })[0]) || d.faculty[0];
      if (!f || !f.awards || !f.awards.length) { el.innerHTML = ''; return; }
      el.innerHTML = '<ul class="award-list">' + f.awards.map(function (a) {
        return '<li>' + esc(t(a)) + '</li>';
      }).join('') + '</ul>';
    },

    /* 학생 목록 — data-group 으로 학위 과정 필터 (phd / msc / bsc / alumni) */
    students: function (el, d) {
      if (!d) return;
      var group = el.dataset.group;
      var list = (d.students || []).filter(function (s) { return !group || s.group === group; });
      if (!list.length) { el.innerHTML = ''; return; }
      el.innerHTML = list.map(function (s) {
        return '<article class="person">' +
          '<img class="photo" src="' + esc(s.photo || 'assets/img/people/placeholder.svg') + '"' +
            ' alt="' + esc(t(s.name)) + '" loading="lazy"' +
            ' onerror="this.src=\'assets/img/people/placeholder.svg\'">' +
          '<h3>' + esc(t(s.name)) + '</h3>' +
          '<div class="role">' + esc(t(s.role)) + '</div>' +
          (s.topic ? '<div class="topic">' + esc(t(s.topic)) + '</div>' : '') +
          (s.links && s.links.length
            ? '<div class="links">' + s.links.map(function (l) { return link(l.url, l.label); }).join('') + '</div>'
            : '') +
          '</article>';
      }).join('');
    },

    /* 협력 연구자 */
    collaborators: function (el, d) {
      if (!d || !d.collaborators) return;
      el.innerHTML = '<ul class="stack">' + d.collaborators.map(function (c) {
        return '<li style="font-size:15px;">' + esc(t(c.name)) +
               ' — <span class="muted">' + esc(t(c.affiliation)) + '</span></li>';
      }).join('') + '</ul>';
    },

    /* 논문 — data-limit 으로 개수 제한 */
    publications: function (el, d) {
      if (!d) return;
      var n = parseInt(el.dataset.limit || '0', 10);
      var items = (d.publications || []).slice();
      if (n) items = items.slice(0, n);
      el.innerHTML = items.map(function (p, i) {
        return '<article class="pub">' +
          '<div class="n">' + String(i + 1).padStart(2, '0') + '</div>' +
          '<div>' +
            '<div class="title">' + (p.url ? link(p.url, p.title) : esc(p.title)) + '</div>' +
            '<div class="authors">' + esc(p.authors) + '</div>' +
            '<div class="venue">' + esc(p.venue) + (p.year ? ', ' + esc(p.year) : '') +
              (p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') +
            '</div>' +
          '</div>' +
        '</article>';
      }).join('');
    },

    /* 진행 중인 연구 프로젝트 — data/research.json 의 projects (research.html) */
    research: function (el, d) {
      if (!d) return;
      var n = parseInt(el.dataset.limit || '0', 10);
      var items = (d.projects || []);
      if (n) items = items.slice(0, n);
      el.innerHTML = items.map(function (p) {
        var collab = (p.collaborators || []).map(function (c) {
          return (c.url ? link(c.url, t(c.name)) : esc(t(c.name))) +
                 (c.affiliation ? ' <span class="muted">(' + esc(t(c.affiliation)) + ')</span>' : '');
        }).join(', ');
        return '<article class="project">' +
          '<h3>' + esc(t(p.title)) + '</h3>' +
          (collab ? '<div class="collab"><span data-lang="en">In collaboration with </span>' +
                    '<span data-lang="ko">공동연구: </span>' + collab + '</div>' : '') +
          (p.status ? '<div class="status">' + esc(t(p.status)) + '</div>' : '') +
        '</article>';
      }).join('');
    },

    /* 뉴스 — 최신순 정렬, data-limit 지원 */
    news: function (el, d) {
      if (!d) return;
      var n = parseInt(el.dataset.limit || '0', 10);
      var items = (d.news || []).slice().sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      });
      if (n) items = items.slice(0, n);
      var showImages = el.dataset.images !== 'false';
      el.innerHTML = items.map(function (it) {
        var refs = (it.links || []).map(function (l) { return link(l.url, t(l.label)); }).join(' · ');
        return '<article class="news-item">' +
          '<div class="date">' + esc(formatDate(it.date)) + '</div>' +
          '<div>' +
            '<h3>' + esc(t(it.title)) + '</h3>' +
            (it.body ? '<p>' + esc(t(it.body)) + '</p>' : '') +
            (it.people ? '<div class="who">' + esc(t(it.people)) + '</div>' : '') +
            (refs ? '<div class="who">' + refs + '</div>' : '') +
            (showImages ? gallery(it) : '') +
          '</div>' +
        '</article>';
      }).join('');
    }
  };

  /* 뉴스 이미지 갤러리 — 3:2 썸네일, 클릭하면 원본 크기로 확대 */
  function gallery(item) {
    var imgs = item.images || [];
    if (!imgs.length) return '';
    return '<div class="news-gallery">' + imgs.map(function (im) {
      var cap = t(im.caption) || t(item.title);
      return '<figure class="shot">' +
        '<button type="button" class="shot-btn" data-full="' + esc(im.src) + '"' +
          ' aria-label="' + esc(cap) + '">' +
          '<img src="' + esc(im.src) + '" alt="' + esc(cap) + '" loading="lazy"' +
            ' onerror="this.closest(\'figure\').style.display=\'none\'">' +
        '</button>' +
        (t(im.caption) ? '<figcaption>' + esc(t(im.caption)) + '</figcaption>' : '') +
      '</figure>';
    }).join('') + '</div>';
  }

  /* 라이트박스 — 배경 클릭, 닫기 버튼, ESC 키로 닫힙니다 */
  function initLightbox() {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
                    '<img alt=""><p class="lb-cap"></p>';
    document.body.appendChild(box);

    var opener = null;
    function open(src, cap) {
      box.querySelector('img').src = src;
      box.querySelector('img').alt = cap || '';
      box.querySelector('.lb-cap').textContent = cap || '';
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('.lb-close').focus();
    }
    function close() {
      box.hidden = true;
      box.querySelector('img').src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.shot-btn');
      if (btn) {
        opener = btn;
        open(btn.dataset.full, btn.getAttribute('aria-label'));
        return;
      }
      if (!box.hidden && (e.target === box || e.target.closest('.lb-close'))) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) close();
    });
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})/.exec(String(iso));
    if (!m) return String(iso);
    var y = m[1], mo = parseInt(m[2], 10);
    return lang === 'ko' ? y + '년 ' + mo + '월' : MONTHS[mo - 1] + ' ' + y;
  }

  function render() {
    document.querySelectorAll('[data-render]').forEach(function (el) {
      var name = el.dataset.render;
      var file = el.dataset.source || name;
      var fn = renderers[name];
      if (!fn) return;
      load(file).then(function (d) { fn(el, d); });
    });
  }

  function boot() {
    initLang();
    buildChrome();
    initLightbox();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
