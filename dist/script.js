const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

const get = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const safeUrl = (value, fallback = '#') => {
  if (typeof value !== 'string') return fallback;
  const url = value.trim();
  return /^(https?:\/\/|mailto:|tel:|#|assets\/)/i.test(url) ? url : fallback;
};

function youtubeEmbed(url) {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
    return /^[\w-]{6,}$/.test(id || '') ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderContent(data) {
  document.title = data.seo?.title || document.title;
  const description = document.querySelector('meta[name="description"]');
  if (description && data.seo?.description) description.content = data.seo.description;

  document.querySelectorAll('[data-cms-text]').forEach((node) => {
    const value = get(data, node.dataset.cmsText);
    if (typeof value === 'string') node.textContent = value;
  });
  document.querySelectorAll('[data-cms-link]').forEach((node) => {
    const value = get(data, node.dataset.cmsLink);
    if (value?.label) node.textContent = value.label;
    node.href = safeUrl(value?.url, node.getAttribute('href'));
  });
  document.querySelectorAll('[data-cms-image]').forEach((node) => {
    const path = node.dataset.cmsImage;
    node.src = safeUrl(get(data, path), node.getAttribute('src'));
    node.alt = get(data, path.replace(/\.image$/, '.imageAlt')) || node.alt;
  });

  const news = document.querySelector('#cms-news');
  if (news && Array.isArray(data.news)) {
    news.replaceChildren(...data.news.map((item) => {
      const card = element('article', 'cms-card');
      if (item.image) { const img = element('img'); img.src = safeUrl(item.image); img.alt = ''; card.append(img); }
      const body = element('div', 'cms-card-body');
      body.append(element('time', '', item.date), element('h3', '', item.title), element('p', '', item.summary));
      if (item.url) { const link = element('a', '', '了解更多 →'); link.href = safeUrl(item.url); body.append(link); }
      card.append(body); return card;
    }));
  }

  const gallery = document.querySelector('#cms-gallery');
  if (gallery && Array.isArray(data.gallery)) gallery.replaceChildren(...data.gallery.map((item) => {
    const figure = element('figure'); const img = element('img'); img.src = safeUrl(item.image); img.alt = item.alt || '';
    const caption = element('figcaption'); caption.append(element('strong', '', item.title), element('span', '', item.caption));
    figure.append(img, caption); return figure;
  }));

  const videosSection = document.querySelector('#videos');
  const videos = document.querySelector('#cms-videos');
  const validVideos = (data.videos || []).map((item) => ({ ...item, embed: youtubeEmbed(item.url) })).filter((item) => item.embed);
  if (videosSection && videos && validVideos.length) {
    videosSection.hidden = false;
    videos.replaceChildren(...validVideos.map((item) => {
      const card = element('article', 'cms-video'); const frame = element('iframe');
      frame.src = item.embed; frame.title = item.title; frame.loading = 'lazy'; frame.allowFullscreen = true;
      card.append(frame, element('h3', '', item.title), element('p', '', item.description)); return card;
    }));
  }

  const ctas = document.querySelector('#cms-ctas');
  if (ctas && Array.isArray(data.ctas)) ctas.replaceChildren(...data.ctas.map((item) => {
    const link = element('a'); link.href = safeUrl(item.url); link.append(element('small', '', item.audience), element('strong', '', item.label), element('span', '', item.linkText)); return link;
  }));

  const website = document.querySelector('[data-cms-contact="website"]');
  if (website) { website.textContent = data.contact?.websiteLabel || website.textContent; website.href = safeUrl(data.contact?.websiteUrl, website.href); }
  const email = document.querySelector('[data-cms-contact="email"]');
  if (email && data.contact?.email) { email.textContent = data.contact.email; email.href = `mailto:${data.contact.email}`; }
}

fetch('content/site.json', { cache: 'no-cache' })
  .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
  .then(renderContent)
  .catch((error) => console.warn('CMS content could not be loaded; showing built-in fallback content.', error));
