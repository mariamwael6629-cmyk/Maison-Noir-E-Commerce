/* ============ ABOUT ============ */
function renderAbout(){
  return `
  <section class="container" style="padding:80px 0 60px; max-width:760px;">
    <span class="eyebrow">Founded 2014, Lisbon</span>
    <h1 class="lux-serif" style="font-size:clamp(32px,5vw,52px); margin:16px 0 28px; line-height:1.15;">We make fewer things, and stand behind every one of them.</h1>
    <p style="color:var(--ivory-dim); font-size:16px; line-height:1.8; margin-bottom:24px;">Maison Noir began as a single workbench in a converted tannery outside Lisbon, where our founder restored vintage trunks for collectors who couldn't find anyone left who knew how. That same workbench is still in use — now alongside two more, in Florence and Kyoto.</p>
    <p style="color:var(--ivory-dim); font-size:16px; line-height:1.8; margin-bottom:24px;">We don't chase seasons. A piece stays in the collection until we've made what we think is the best version of it, and then it's retired — numbered, documented, and repaired for free for as long as you own it.</p>
    <div class="hero-visual-frame" style="aspect-ratio:16/9; margin:48px 0;"><img src="${DECOR_IMG.collA}" alt="Atelier workbench"></div>
    <div class="seal-divider" style="margin:48px 0;"><span class="line"></span><span class="mark"></span><span class="line"></span></div>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:32px; text-align:center;">
      <div><div class="lux-serif" style="font-size:32px; color:var(--copper-bright);">3</div><div style="font-size:13px; color:var(--ivory-faint); margin-top:4px;">Ateliers</div></div>
      <div><div class="lux-serif" style="font-size:32px; color:var(--copper-bright);">12yrs</div><div style="font-size:13px; color:var(--ivory-faint); margin-top:4px;">In operation</div></div>
      <div><div class="lux-serif" style="font-size:32px; color:var(--copper-bright);">∞</div><div style="font-size:13px; color:var(--ivory-faint); margin-top:4px;">Repair guarantee</div></div>
    </div>
  </section>`;
}
