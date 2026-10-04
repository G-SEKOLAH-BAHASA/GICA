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


// Lightweight Chinese / Indonesian language switcher.
const staticTranslations = {"跳到主要內容":"Lewati ke konten utama","巴哈薩語言學校":"Sekolah Bahasa","選單":"Menu","關於 GICA":"Tentang GICA","學員故事":"Kisah Siswa","語言學校":"Sekolah Bahasa","全人關懷":"Pendampingan Menyeluruh","故事與影響力":"Kisah & Dampak","影音與社群":"Video & Media Sosial","看見更多 GICA 的影片與日常":"Lihat lebih banyak video dan keseharian GICA","透過影片與社群，認識 GICA 的課程、活動、文化交流與陪伴故事。":"Kenali kelas, kegiatan, pertukaran budaya, dan kisah pendampingan GICA melalui video dan media sosial.","加入行動":"Mari Terlibat","我要報名":"Daftar Sekarang","GICA 實地探訪與學員關懷紀錄照":"Dokumentasi kunjungan dan pendampingan siswa oleh GICA","她在東爪哇的小村莊長大。接連失去父母後，為了照顧三個年幼的弟弟妹妹，她中斷學業，白天在小店工作，晚上再到咖啡廳忙到凌晨。十七歲離開家鄉，後來來到臺灣；陌生的語言、氣候與孤獨，讓她曾無數次想過放棄。":"Ia tumbuh di sebuah desa kecil di Jawa Timur. Setelah kehilangan kedua orang tuanya, ia berhenti sekolah demi merawat tiga adiknya. Siang hari ia bekerja di toko kecil, malam hari di kafe hingga dini hari. Pada usia 17 tahun ia meninggalkan kampung halaman dan kemudian datang ke Taiwan. Bahasa, cuaca, dan rasa sepi yang asing membuatnya berkali-kali ingin menyerah.","支撐她走下去的，是讓弟弟妹妹繼續讀書、讓家裡那間漏雨的房子慢慢被修好的盼望。這篇作品提醒我們：每一位走進教室的學員，都帶著一段家庭責任、失落、韌性與尚未放下的夢想。":"Yang membuatnya terus bertahan adalah harapan agar adik-adiknya dapat terus bersekolah dan rumah keluarga yang bocor perlahan dapat diperbaiki. Kisah ini mengingatkan kami bahwa setiap siswa yang masuk ke kelas membawa tanggung jawab keluarga, kehilangan, ketangguhan, dan mimpi yang belum mereka lepaskan.","語言課不只教會她如何表達。":"Kelas bahasa bukan hanya mengajarkannya cara berkomunikasi.","它也讓一個人重新擁有學習的機會，在異鄉被聽見，知道需要時可以向誰求助。":"Kelas juga memberinya kesempatan untuk belajar kembali, didengar di negeri asing, dan tahu kepada siapa ia dapat meminta bantuan saat membutuhkan.","GICA 成立":"GICA Didirikan","展開印尼移工關懷、訪視、健康促進與社區服務。":"Memulai pendampingan pekerja migran Indonesia, kunjungan, promosi kesehatan, dan pelayanan komunitas.","走入生活現場":"Hadir dalam Kehidupan","累積志工服務、文化交流與臺印社群陪伴經驗。":"Membangun pengalaman dalam pelayanan relawan, pertukaran budaya, dan pendampingan komunitas Taiwan–Indonesia.","BAHASA 草創":"BAHASA Dimulai","開辦印尼移工線上小班華語課程，讓工作忙碌的人也能持續學習。":"Membuka kelas Mandarin daring dalam kelompok kecil bagi pekerja migran Indonesia agar mereka tetap dapat belajar di tengah kesibukan kerja.","語言學校 2.0":"Sekolah Bahasa 2.0","維持 20 個小班，深化全人支持，讓資深學員受訓後回班服務。":"Mempertahankan 20 kelas kecil, memperdalam dukungan menyeluruh, dan melatih siswa senior agar dapat kembali mendampingi kelas.","語":"語","教學系統":"Sistem Pembelajaran","兩年 84 堂華語／台語課程":"84 sesi Mandarin/Taiwanese selama dua tahun","師資培訓與季度教研":"Pelatihan pengajar dan pengembangan pembelajaran tiap kuartal","生活情境教材、短影音、學習包":"Materi situasi sehari-hari, video pendek, dan paket belajar","彈性補課與學習歷程":"Kelas pengganti fleksibel dan rekam jejak belajar","查看課程與招生":"Lihat kelas & pendaftaran","伴":"伴","陪伴系統":"Sistem Pendampingan","班級導師雙週關懷":"Pendampingan wali kelas setiap dua minggu","伴讀志工課後練習":"Latihan setelah kelas bersama relawan belajar","學員訪視與需求辨識":"Kunjungan siswa dan identifikasi kebutuhan","心理、醫療、勞權分級轉介":"Rujukan bertahap untuk psikologis, medis, dan hak ketenagakerjaan","認識陪伴角色":"Kenali peran pendamping","長":"長","全人發展":"Pengembangan Diri Menyeluruh","每月全校生活支持工作坊":"Lokakarya dukungan kehidupan setiap bulan","畢業後生命成長課程":"Program pengembangan diri setelah lulus","防詐、合約、就醫與數位能力":"Anti-penipuan, kontrak, layanan medis, dan literasi digital","中階人才與進階學習準備":"Persiapan pengembangan talenta dan pembelajaran lanjutan","了解全人關懷":"Pelajari pendampingan menyeluruh","家":"家","社群與文化":"Komunitas & Budaya","OPEN HOUSE 印尼友誼日":"OPEN HOUSE Hari Persahabatan Indonesia","臺印文化交流":"Pertukaran budaya Taiwan–Indonesia","印尼國慶慶祝活動":"Perayaan Hari Kemerdekaan Indonesia","社區服務與志工行動":"Pelayanan komunitas dan kegiatan relawan","看見社群故事":"Lihat kisah komunitas","從學員，到陪伴下一位學員的人":"Dari siswa menjadi pendamping bagi siswa berikutnya","完成學習不是終點。資深印尼學員完成兩年學制與師資培訓後，能以受教師督導的特殊教學支持角色回到班級，把自己的經驗變成下一個人的力量。":"Menyelesaikan pembelajaran bukanlah akhir. Setelah menuntaskan program dua tahun dan pelatihan pengajar, siswa senior Indonesia dapat kembali ke kelas dalam peran pendukung pembelajaran di bawah supervisi guru, menjadikan pengalaman mereka kekuatan bagi orang berikutnya.","印尼籍資深學員教學志工／學習助教":"Relawan pengajar siswa senior Indonesia / asisten belajar","加入 BAHASA":"Bergabung dengan BAHASA","找到適合自己的小班":"Temukan kelas kecil yang sesuai","兩年 84 堂":"84 sesi dalam dua tahun","累積語言與生活能力":"Bangun kemampuan bahasa dan kehidupan","生命成長與師培":"Pengembangan diri & pelatihan pengajar","觀課、試教與實習":"Observasi, praktik mengajar, dan magang","回班服務":"Kembali mendampingi kelas","陪伴下一位學員":"Dampingi siswa berikutnya","醫療就醫":"Akses Kesehatan","情緒支持":"Dukungan Emosional","勞動權益":"Hak Ketenagakerjaan","合約防詐":"Kontrak & Anti-penipuan","數位生活":"Kehidupan Digital","不只回應問題，也提早建立安全感。":"Bukan hanya menanggapi masalah, tetapi juga membangun rasa aman sejak dini.","雙週":"Dua mingguan","班級關懷與學習追蹤":"Pendampingan kelas dan pemantauan belajar","每月":"Setiap bulan","全校生活支持工作坊":"Lokakarya dukungan kehidupan untuk seluruh sekolah","需要時":"Saat diperlukan","保密的專業轉介與陪伴":"Rujukan profesional dan pendampingan yang menjaga kerahasiaan","每一種陪伴，都有清楚的角色與界線":"Setiap bentuk pendampingan memiliki peran dan batas yang jelas","語言教師":"Pengajar Bahasa","設計課程、授課、評量並督導教學。":"Merancang kelas, mengajar, menilai, dan mengawasi pembelajaran.","主要教學":"Pengajaran utama","資深學員教學志工":"Relawan Pengajar Siswa Senior","示範、協助練習，連結語言與文化經驗。":"Memberi contoh, membantu latihan, serta menghubungkan pengalaman bahasa dan budaya.","受教師督導":"Di bawah supervisi guru","班級導師":"Wali Kelas","經營班級、雙週關懷、辨識需求與轉介。":"Mengelola kelas, melakukan pendampingan dua mingguan, mengenali kebutuhan, dan melakukan rujukan.","生活支持":"Dukungan kehidupan","伴讀志工":"Relawan Pendamping Belajar","提供課後練習、數位協助與學習陪伴。":"Mendampingi latihan setelah kelas, bantuan digital, dan proses belajar.","輔助學習":"Dukungan belajar","學習、文化與成就，都是在臺生活的一部分":"Belajar, budaya, dan pencapaian adalah bagian dari kehidupan di Taiwan","課堂讓彼此聽懂，活動讓文化被看見，舞台與證書則讓努力留下可被記得的證明。":"Kelas membantu kita saling memahami, kegiatan membuat budaya terlihat, dan panggung serta sertifikat menjadi bukti usaha yang dapat dikenang.","文化被看見":"Budaya Terlihat","印尼國慶與文化交流活動":"Perayaan Kemerdekaan Indonesia dan pertukaran budaya","努力被肯定":"Usaha Diapresiasi","語言才藝活動與學習成果":"Kegiatan bahasa, bakat, dan hasil belajar","最新活動與消息":"Berita & Kegiatan Terbaru","影音紀錄":"Dokumentasi Video","我們追求的不是更多班，":"Yang kami kejar bukan lebih banyak kelas,","而是每位學員都被看見。":"melainkan agar setiap siswa benar-benar diperhatikan.","個小班":"kelas kecil","年度品質上限":"batas kualitas tahunan","班次":"sesi kelas","全年持續學習":"pembelajaran sepanjang tahun","場工作坊":"lokakarya","回應生活需求":"menjawab kebutuhan hidup","資深學員":"siswa senior","完成訓練回班":"selesai pelatihan & kembali ke kelas","你想從哪裡，加入這段同行？":"Bagaimana Anda ingin ikut berjalan bersama kami?","網站示範頁｜內容與連結於正式上線前仍需確認":"Situs demo | Konten dan tautan masih akan dikonfirmasi sebelum peluncuran resmi","了解更多 →":"Selengkapnya →"};
const originalTextNodes = new Map();
function translateStatic(lang) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node)=>{
    if(!originalTextNodes.has(node)) originalTextNodes.set(node,node.nodeValue);
    const original=originalTextNodes.get(node);
    if(lang==='zh-TW'){ node.nodeValue=original; return; }
    const key=original.trim(); if(!staticTranslations[key]) return;
    node.nodeValue=original.replace(key,staticTranslations[key]);
  });
}
async function setLanguage(lang, persist=true){
  const normalized=lang==='id'?'id':'zh-TW';
  document.documentElement.lang=normalized==='id'?'id':'zh-Hant';
  document.querySelector('.language-toggle')?.setAttribute('data-language',normalized);
  translateStatic(normalized);
  try {
    const response=await fetch(normalized==='id'?'content/site-id.json':'content/site.json',{cache:'no-cache'});
    if(!response.ok) throw new Error('HTTP '+response.status);
    renderContent(await response.json());
  } catch(error){ console.warn('Localized CMS content could not be loaded.',error); }
  if(persist) localStorage.setItem('gica-language',normalized);
}
const languageButton=document.querySelector('.language-toggle');
languageButton?.addEventListener('click',()=>setLanguage(document.documentElement.lang==='id'?'zh-TW':'id'));
const savedLanguage=localStorage.getItem('gica-language');
const initialLanguage=savedLanguage || 'id';
setLanguage(initialLanguage,false);
