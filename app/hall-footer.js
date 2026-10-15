// Keep the legal footer visible in the hall after every hall redraw.
(() => {
  const hall = document.getElementById('v-hall');
  if (!hall) return;
  const put = () => {
    if (!hall.querySelector('.hhead')) return;
    const en = document.documentElement.lang.toLowerCase().startsWith('en');
    const old = hall.querySelector('.chSiteFoot.chInHall');
    if (old && old.dataset.lang === (en ? 'en' : 'zh')) return;
    if (old) old.remove();
    const base = `https://getclasshero.com/${en ? 'en/' : ''}`;
    const links = en
      ? [['', 'Home'], ['faq.html', 'FAQ'], ['terms.html', 'Terms'], ['refunds.html', 'Refunds'], ['privacy.html', 'Privacy'], ['contact.html', 'Contact']]
      : [['', '首頁'], ['faq.html', '常見問題'], ['terms.html', '使用條款'], ['refunds.html', '退款政策'], ['privacy.html', '私隱政策'], ['contact.html', '聯絡我們']];
    const foot = document.createElement('div');
    foot.className = 'chSiteFoot chInHall';
    foot.setAttribute('role', 'contentinfo');
    foot.setAttribute('translate', 'no');
    foot.dataset.lang = en ? 'en' : 'zh';
    const nav = document.createElement('p');
    links.forEach(([path, label], i) => {
      if (i) nav.append(' · ');
      const a = document.createElement('a');
      a.href = base + path;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = label;
      nav.append(a);
    });
    const operator = document.createElement('p');
    operator.append(en
      ? 'ClassHero is operated by KTH Studio, an independent software developer based in Hong Kong. Contact: '
      : '班級英雄 ClassHero 由香港獨立軟件開發者 KTH Studio 營運。聯絡：');
    const email = document.createElement('a');
    email.href = 'mailto:riceisgd@hotmail.com';
    email.textContent = 'riceisgd@hotmail.com';
    operator.append(email);
    const copyright = document.createElement('p');
    copyright.textContent = en ? '© 2026 ClassHero. All rights reserved.' : '© 2026 班級英雄 ClassHero。保留所有權利。';
    foot.append(nav, operator, copyright);
    hall.append(foot);
  };
  new MutationObserver(put).observe(hall, { childList: true });
  new MutationObserver(put).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  put();
})();
