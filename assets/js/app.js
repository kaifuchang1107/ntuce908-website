/* Lab of Eco-hydrology and Eco-DRR — site runtime
   No build step: plain ES modules-free JS, content comes from /content/*.json */

const UI = {
  zh: {
    nav_home: '首頁', nav_research: '研究主題', nav_pi: '主持人',
    nav_members: '研究成員', nav_pubs: '學術著作', nav_news: '最新消息',
    hero_cta_research: '研究主題', hero_cta_pubs: '學術著作',
    research_title: '研究主題', research_sub: '本研究室以水利工程與生態學的整合觀點，探討河川、濕地與海岸的過程與管理。',
    read_more: '詳細內容 →',
    news_title: '最新消息', news_more: '更多',
    pubs_title: '學術著作', pubs_sub: '期刊論文依年份排列，點擊 DOI 可連結全文。',
    pubs_search: '搜尋標題、作者或期刊…', pubs_all_years: '全部年份', pubs_all_journals: '全部期刊',
    pubs_count: n => `共 ${n} 篇`,
    members_title: '研究成員',
    group_staff: '研究人員', group_student: '在學學生', group_alumni: '畢業校友',
    hometown: '家鄉', education: '學歷',
    pi_title: '主持人', pi_about: '簡介', pi_interests: '研究興趣', pi_courses: '教授課程',
    contact: '聯絡我們', links: '相關連結', address: '地址', email: '電子郵件', phone: '電話',
    empty: '目前沒有資料。',
    footer_rights: '版權所有',
    years_active: '發表年間',
  },
  en: {
    nav_home: 'Home', nav_research: 'Research', nav_pi: 'PI',
    nav_members: 'Members', nav_pubs: 'Publications', nav_news: 'News',
    hero_cta_research: 'Research', hero_cta_pubs: 'Publications',
    research_title: 'Research', research_sub: 'We study the processes and management of rivers, wetlands and coasts by integrating hydraulic engineering with ecology.',
    read_more: 'Read more →',
    news_title: 'News', news_more: 'More',
    pubs_title: 'Publications', pubs_sub: 'Peer-reviewed journal articles by year. Follow the DOI link for the full text.',
    pubs_search: 'Search title, author or journal…', pubs_all_years: 'All years', pubs_all_journals: 'All journals',
    pubs_count: n => `${n} article${n === 1 ? '' : 's'}`,
    members_title: 'Lab Members',
    group_staff: 'Research Fellow', group_student: 'Students', group_alumni: 'Alumni',
    hometown: 'Hometown', education: 'Education',
    pi_title: 'Principal Investigator', pi_about: 'About', pi_interests: 'Research Interests', pi_courses: 'Teaching Courses',
    contact: 'Contact', links: 'Links', address: 'Address', email: 'Email', phone: 'Phone',
    empty: 'Nothing here yet.',
    footer_rights: 'All rights reserved',
    years_active: 'Years published',
  }
};

const LANGS = ['zh', 'en'];
let lang = localStorage.getItem('lang')
  || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
if (!LANGS.includes(lang)) lang = 'zh';

const t = k => UI[lang][k];
const pick = (obj, base) => {
  const v = obj[`${base}_${lang}`];
  const alt = obj[`${base}_${lang === 'zh' ? 'en' : 'zh'}`];
  const has = x => Array.isArray(x) ? x.length : (x !== undefined && x !== null && x !== '');
  if (has(v)) return v;
  if (has(alt)) return alt;
  return Array.isArray(v) || Array.isArray(alt) ? [] : '';
};
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// list files are stored as { key: [...] } so the CMS can edit them as a collection
const LIST_KEY = { research: 'topics', members: 'people', publications: 'publications', news: 'news' };

async function load(name) {
  const res = await fetch(`content/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`content/${name}.json → ${res.status}`);
  const data = await res.json();
  const key = LIST_KEY[name];
  if (!key) return data;
  const list = Array.isArray(data) ? data : (data[key] || []);
  if (name === 'publications') return list.slice().sort((a, b) => b.year - a.year);
  if (name === 'news') return list.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (name === 'members') {
    const order = { staff: 0, student: 1, alumni: 2 };
    return list.slice().sort((a, b) =>
      (order[a.group] ?? 9) - (order[b.group] ?? 9) || (b.grad_year || 0) - (a.grad_year || 0));
  }
  return list;
}

/* ---------- chrome ---------- */

function buildHeader(site) {
  const page = document.body.dataset.page;
  const items = [
    ['index.html', 'nav_home'],
    ['research.html', 'nav_research'],
    ['pi.html', 'nav_pi'],
    ['members.html', 'nav_members'],
    ['publications.html', 'nav_pubs'],
  ];
  const header = document.querySelector('.site-header .header-inner');
  header.innerHTML = `
    <a class="brand" href="index.html">
      <img src="${esc(site.logo)}" alt="">
      <span class="brand-text">
        <strong>${esc(pick(site, 'lab_name'))}</strong>
        <span>${esc(pick(site, 'affiliation'))}</span>
      </span>
    </a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span></button>
    <nav class="nav">
      ${items.map(([href, key]) =>
        `<a href="${href}"${href.startsWith(page) ? ' class="active"' : ''}>${esc(t(key))}</a>`).join('')}
    </nav>
    <div class="lang-toggle">
      ${LANGS.map(l => `<button data-lang="${l}" aria-pressed="${l === lang}">${l === 'zh' ? '中' : 'EN'}</button>`).join('')}
    </div>`;

  header.querySelectorAll('.lang-toggle button').forEach(b =>
    b.addEventListener('click', () => setLang(b.dataset.lang)));
  const toggle = header.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const nav = header.querySelector('.nav');
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

function buildFooter(site) {
  const c = site.contact;
  document.querySelector('.site-footer .wrap').innerHTML = `
    <div class="footer-grid">
      <div>
        <h4>${esc(pick(site, 'lab_name'))}</h4>
        <p style="margin:0">${esc(pick(site, 'affiliation'))}</p>
      </div>
      <div>
        <h4>${esc(t('contact'))}</h4>
        <ul>
          <li>${esc(pick(c, 'address'))}</li>
          <li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
          <li>${esc(c.phone)}</li>
        </ul>
      </div>
      <div>
        <h4>${esc(t('links'))}</h4>
        <ul>${(c.links || []).map(l =>
          `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(pick(site, 'lab_name'))}. ${esc(t('footer_rights'))}.</span>
      <span>${esc(pick(site, 'affiliation'))}</span>
    </div>`;
}

function setLang(next) {
  lang = next;
  localStorage.setItem('lang', next);
  document.documentElement.lang = next === 'zh' ? 'zh-Hant' : 'en';
  render();
}

/* ---------- page renderers ---------- */

const pages = {};

pages.index = async () => {
  const [site, research, pubs, news] = await Promise.all(
    ['site', 'research', 'publications', 'news'].map(load));
  const members = await load('members');

  const hero = document.querySelector('.hero');
  hero.style.backgroundImage = `url("${site.hero_image}")`;
  hero.querySelector('.wrap').innerHTML = `
    <h1>${esc(pick(site, 'lab_name'))}</h1>
    <p class="affil">${esc(pick(site, 'affiliation'))}</p>
    <p class="tagline">${esc(pick(site, 'tagline'))}</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="research.html">${esc(t('hero_cta_research'))}</a>
      <a class="btn btn-ghost" href="publications.html">${esc(t('hero_cta_pubs'))}</a>
    </div>`;

  document.querySelector('#research-preview').innerHTML = `
    <div class="wrap">
      <h2 class="section-title">${esc(t('research_title'))}</h2>
      <p class="section-sub">${esc(t('research_sub'))}</p>
      <div class="cards">
        ${research.map(r => `
          <article class="card">
            <img class="thumb" src="${esc(r.image)}" alt="">
            <div class="card-body">
              <h3>${esc(pick(r, 'title'))}</h3>
              <p>${esc(pick(r, 'summary'))}</p>
              <a class="more" href="research.html#${esc(r.id)}">${esc(t('read_more'))}</a>
            </div>
          </article>`).join('')}
      </div>
    </div>`;

  const years = pubs.map(p => p.year).filter(Boolean);
  document.querySelector('#stats').innerHTML = `
    <div class="wrap">
      <div class="stats">
        <div class="stat"><strong>${pubs.length}</strong><span>${esc(t('nav_pubs'))}</span></div>
        <div class="stat"><strong>${research.length}</strong><span>${esc(t('research_title'))}</span></div>
        <div class="stat"><strong>${members.filter(m => m.group !== 'alumni').length}</strong><span>${esc(t('nav_members'))}</span></div>
        <div class="stat"><strong>${Math.min(...years)}–${Math.max(...years)}</strong><span>${esc(t('years_active'))}</span></div>
      </div>
    </div>`;

  const recent = pubs.slice(0, 5);
  document.querySelector('#recent').innerHTML = `
    <div class="wrap">
      <h2 class="section-title">${esc(t('pubs_title'))}</h2>
      <p class="section-sub">${esc(t('pubs_sub'))}</p>
      <ul class="pub-list">${recent.map((p, i) => pubHTML(p, i + 1)).join('')}</ul>
      <p style="text-align:center;margin-top:28px">
        <a class="btn btn-primary" href="publications.html">${esc(t('news_more'))}</a></p>
    </div>`;

  document.querySelector('#news').innerHTML = `
    <div class="wrap">
      <h2 class="section-title">${esc(t('news_title'))}</h2>
      <ul class="news-list" style="margin:24px auto 0">
        ${news.length ? news.map(n => `
          <li class="news-item">
            <time datetime="${esc(n.date)}">${esc(n.date)}</time>
            <div>
              <h3>${esc(pick(n, 'title'))}</h3>
              <p>${esc(pick(n, 'body'))}</p>
              ${n.link ? `<p><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(t('news_more'))} →</a></p>` : ''}
            </div>
          </li>`).join('') : `<li class="empty">${esc(t('empty'))}</li>`}
      </ul>
    </div>`;

  return site;
};

pages.research = async () => {
  const [site, research] = await Promise.all(['site', 'research'].map(load));
  setPageHead(site, t('research_title'), t('research_sub'), site.hero_image);

  document.querySelector('#topics').innerHTML = research.map(r => `
    <div class="topic" id="${esc(r.id)}">
      <div class="wrap topic-grid">
        <div>
          <h2>${esc(pick(r, 'title'))}</h2>
          <p class="lede">${esc(pick(r, 'summary'))}</p>
          <ul>${pick(r, 'points').map(p => `<li>${esc(p)}</li>`).join('')}</ul>
        </div>
        <img src="${esc(r.image)}" alt="">
      </div>
    </div>`).join('');
  return site;
};

pages.pi = async () => {
  const [site, pi] = await Promise.all(['site', 'pi'].map(load));
  setPageHead(site, t('pi_title'), '', 'assets/img/site/pi-bg.jpg');

  document.querySelector('#pi').innerHTML = `
    <div class="wrap pi-grid">
      <aside class="pi-card">
        <img src="${esc(pi.photo)}" alt="${esc(pick(pi, 'name'))}">
        <h2>${esc(pick(pi, 'name'))}　<span style="font-size:16px;color:var(--ink-faint)">${esc(pick(pi, 'title'))}</span></h2>
        <p class="en">${esc(lang === 'zh' ? pi.name_en : pi.name_zh)}</p>
        <ul>${pick(pi, 'positions').map(p => `<li>${esc(p)}</li>`).join('')}</ul>
        <a class="btn btn-primary" href="mailto:${esc(pi.email)}">${esc(t('email'))}</a>
      </aside>
      <div>
        <div class="pi-bio">
          <h3 style="margin-top:0;color:var(--green-800)">${esc(t('pi_about'))}</h3>
          <p>${esc(pick(pi, 'bio'))}</p>
        </div>
        <div class="pi-cols">
          <div>
            <h3>${esc(t('pi_interests'))}</h3>
            <ul>${pick(pi, 'interests').map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          </div>
          <div>
            <h3>${esc(t('pi_courses'))}</h3>
            <ul>${pick(pi, 'courses').map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
    </div>`;
  return site;
};

pages.members = async () => {
  const [site, people] = await Promise.all(['site', 'members'].map(load));
  setPageHead(site, t('members_title'), '', 'assets/img/site/bg-2.jpg');

  const groups = [['staff', 'group_staff'], ['student', 'group_student'], ['alumni', 'group_alumni']];
  document.querySelector('#members').innerHTML = groups.map(([g, key], i) => {
    const list = people.filter(p => p.group === g);
    if (!list.length) return '';
    return `
      <section class="${i % 2 ? 'alt' : ''}">
        <div class="wrap">
          <h2 class="section-title">${esc(t(key))}</h2>
          <div class="people" style="margin-top:32px">${list.map(personHTML).join('')}</div>
        </div>
      </section>`;
  }).join('');
  return site;
};

pages.publications = async () => {
  const [site, pubs] = await Promise.all(['site', 'publications'].map(load));
  setPageHead(site, t('pubs_title'), t('pubs_sub'), 'assets/img/site/bg-3.jpg');

  const years = [...new Set(pubs.map(p => p.year))].sort((a, b) => b - a);
  const journals = [...new Set(pubs.map(p => p.journal).filter(Boolean))].sort();

  document.querySelector('#pubs').innerHTML = `
    <div class="wrap">
      <div class="pub-tools">
        <input id="q" type="search" placeholder="${esc(t('pubs_search'))}" autocomplete="off">
        <select id="fy"><option value="">${esc(t('pubs_all_years'))}</option>
          ${years.map(y => `<option>${y}</option>`).join('')}</select>
        <select id="fj"><option value="">${esc(t('pubs_all_journals'))}</option>
          ${journals.map(j => `<option>${esc(j)}</option>`).join('')}</select>
        <span class="pub-count" id="count"></span>
      </div>
      <div id="pub-results"></div>
    </div>`;

  const q = document.querySelector('#q');
  const fy = document.querySelector('#fy');
  const fj = document.querySelector('#fj');

  const draw = () => {
    const term = q.value.trim().toLowerCase();
    const list = pubs.filter(p =>
      (!fy.value || String(p.year) === fy.value) &&
      (!fj.value || p.journal === fj.value) &&
      (!term || `${p.title} ${p.authors} ${p.journal} ${p.detail}`.toLowerCase().includes(term)));

    document.querySelector('#count').textContent = t('pubs_count')(list.length);
    const box = document.querySelector('#pub-results');
    if (!list.length) { box.innerHTML = `<p class="empty">${esc(t('empty'))}</p>`; return; }

    let html = '', current = null, n = 0;
    for (const p of list) {
      if (p.year !== current) {
        if (current !== null) html += '</ul>';
        current = p.year;
        html += `<div class="pub-year"><h2>${p.year}</h2><div class="rule"></div></div><ul class="pub-list">`;
      }
      html += pubHTML(p, ++n, term);
    }
    box.innerHTML = html + '</ul>';
  };

  [q, fy, fj].forEach(n => n.addEventListener('input', draw));
  draw();
  return site;
};

/* ---------- partials ---------- */

function highlight(text, term) {
  const safe = esc(text);
  if (!term) return safe;
  return safe.replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
}

function pubHTML(p, n, term) {
  if (!p.title) {
    return `<li class="pub"><span class="num">${n}.</span>${highlight(p.detail, term)}
      ${p.link ? `<a class="doi" href="${esc(p.link)}" target="_blank" rel="noopener">DOI</a>` : ''}</li>`;
  }
  return `<li class="pub">
    <span class="num">${n}.</span>
    <span class="authors">${highlight(p.authors, term)}</span>,
    <span class="year">${p.year}</span>,
    <span class="pub-title">${highlight(p.title, term)}</span>,
    <span class="journal">${highlight(p.journal, term)}</span>${p.detail ? `, <span class="detail">${esc(p.detail)}</span>` : ''}.
    ${p.link ? `<a class="doi" href="${esc(p.link)}" target="_blank" rel="noopener">DOI</a>` : ''}
  </li>`;
}

function personHTML(p) {
  const name = lang === 'zh' ? (p.name_zh || p.name_en) : (p.name_en || p.name_zh);
  const sub = lang === 'zh' ? p.name_en : p.name_zh;
  const photo = p.photo
    ? `<img class="avatar" src="${esc(p.photo)}" alt="${esc(name)}" loading="lazy">`
    : `<div class="avatar placeholder">${esc((name || '?').slice(0, 1))}</div>`;
  const topic = pick(p, 'topic');
  return `<article class="person">
    ${photo}
    <div class="person-body">
      <h3>${esc(name)}</h3>
      <p class="name-en">${esc(sub || '')}</p>
      <span class="role">${esc(pick(p, 'role'))}</span>
      ${topic ? `<p class="topic-text">${esc(topic)}</p>` : ''}
      <p class="meta">
        ${(p.education || []).map(e => esc(e)).join('<br>')}
        ${p.hometown_en ? `<br>${esc(t('hometown'))}：${esc(pick(p, 'hometown'))}` : ''}
      </p>
    </div>
  </article>`;
}

function setPageHead(site, title, sub, image) {
  const head = document.querySelector('.page-head');
  if (!head) return;
  if (image) head.style.backgroundImage = `url("${image}")`;
  head.querySelector('.wrap').innerHTML =
    `<h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}`;
}

/* ---------- boot ---------- */

async function render() {
  const page = document.body.dataset.page;
  try {
    const site = await (pages[page] || pages.index)();
    buildHeader(site);
    buildFooter(site);
    document.title = `${document.body.dataset.title ? t(document.body.dataset.title) + ' — ' : ''}${pick(site, 'lab_name')}`;
  } catch (err) {
    console.error(err);
    document.querySelector('main').innerHTML =
      `<div class="wrap"><p class="empty">${esc(err.message)}<br>
       請以本機伺服器開啟（例如 <code>python -m http.server</code>），直接雙擊 HTML 檔無法載入內容。</p></div>`;
  }
}

document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
render();
