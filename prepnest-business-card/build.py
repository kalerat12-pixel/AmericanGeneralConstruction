# Builds card.html: US business card 3.5x2 in, 0.125 in bleed on every side (3.75x2.25 in pages).
n, path = open('qr.svgpath').read().split('|')
LOGO = '''<svg viewBox="92 92 840 840" class="{cls}" xmlns="http://www.w3.org/2000/svg">
<rect x="96.5" y="96.5" width="831" height="831" rx="166" fill="{bg}" stroke="#C4A36B" stroke-width="9"/>
<g fill="none" stroke-linecap="round">
<path d="M262 538 Q512 446 762 538" stroke="#A6824A" stroke-width="30"/>
<ellipse cx="512" cy="440" rx="150" ry="186" fill="#F6F1E8" stroke="none"/>
<path d="M252 540 Q512 682 774 540" stroke="#D8BD87" stroke-width="46"/>
<path d="M296 620 Q512 752 730 620" stroke="#C4A36B" stroke-width="46"/>
<path d="M356 696 Q512 800 668 696" stroke="#A6824A" stroke-width="46"/></g></svg>'''
NEST = '''<svg class="nest" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-width="10">
<path d="M-40 60 Q500 420 1040 60" stroke="#D8BD87"/><path d="M40 150 Q500 470 960 150" stroke="#C4A36B"/><path d="M160 240 Q500 500 840 240" stroke="#A6824A"/></g></svg>'''
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Fraunces;src:url(fonts/Fraunces_400Regular.ttf);font-weight:400}}
@font-face{{font-family:Fraunces;src:url(fonts/Fraunces_400Regular_Italic.ttf);font-style:italic}}
@font-face{{font-family:Fraunces;src:url(fonts/Fraunces_500Medium.ttf);font-weight:500}}
@page{{size:3.75in 2.25in;margin:0}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:#fff}}
.page{{width:3.75in;height:2.25in;position:relative;overflow:hidden;page-break-after:always}}
/* trim box sits 0.125in in from every edge; safe area another 0.125in inside that */
.safe{{position:absolute;inset:.25in}}
.front{{background:radial-gradient(ellipse at 50% 38%,#2C5A42 0%,#1F3D2E 55%,#152B20 100%);color:#F3ECDF}}
.front .nest{{position:absolute;left:-.1in;right:-.1in;bottom:-.62in;width:3.95in;opacity:.14}}
.front .safe{{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}}
.icon{{width:.62in;height:.62in}}
.word{{font-family:Fraunces;font-weight:500;font-size:27pt;letter-spacing:-.01em;line-height:1;margin-top:.08in}}
.tag{{font-family:Fraunces;font-size:11pt;margin-top:.05in}}
.tag em{{color:#D8BD87}}
.back{{background:#F6F1E8;color:#1B1A17}}
.back .safe{{display:flex;gap:.16in;align-items:center}}
.info{{flex:1;min-width:0}}
.kicker{{font-family:Inter;font-weight:600;font-size:5.4pt;letter-spacing:.16em;color:#2C5A42;display:flex;align-items:center;gap:.05in}}
.kicker:before{{content:"";width:.16in;height:.6pt;background:#C4A36B}}
h2{{font-family:Fraunces;font-weight:400;font-size:13.5pt;line-height:1.05;margin-top:.05in;letter-spacing:-.01em}}
h2 em{{color:#2C5A42}}
.desc{{font-family:Inter;font-size:6.3pt;line-height:1.4;color:#4A4640;margin-top:.06in}}
.launch{{display:inline-flex;align-items:center;gap:.04in;font-family:Inter;font-weight:500;font-size:5.6pt;color:#1F3D2E;background:#E4EBE3;border-radius:1in;padding:.025in .07in;margin-top:.07in}}
.launch i{{width:4pt;height:4pt;border-radius:50%;background:#A6824A;display:block}}
.url{{font-family:Fraunces;font-weight:500;font-size:10pt;color:#1F3D2E;margin-top:.07in}}
.mail{{font-family:Inter;font-size:5.8pt;color:#6B655B;margin-top:.015in}}
.qrbox{{width:1.12in;text-align:center}}
.tile{{background:#fff;border-radius:.09in;padding:.075in;box-shadow:0 0 0 .6pt #E2D9C8}}
.tile svg{{display:block;width:100%;height:auto}}
.scan{{font-family:Inter;font-weight:600;font-size:5.6pt;color:#1F3D2E;margin-top:.055in;letter-spacing:.02em}}
.scan small{{display:block;font-weight:400;color:#6B655B;font-size:5pt;margin-top:.01in;letter-spacing:0}}
.stripe{{position:absolute;left:0;right:0;bottom:0;height:.2in;background:#1F3D2E}}
.stripe:before{{content:"";position:absolute;left:0;right:0;top:0;height:1.4pt;background:#C4A36B}}
.guides .page:after{{content:"";position:absolute;inset:.125in;border:.5pt dashed rgba(255,0,0,.7);pointer-events:none}}
</style></head><body class="__GUIDES__">
<section class="page front">{NEST}<div class="safe">
{LOGO.format(cls="icon", bg="#1B3628")}
<div class="word">PrepNest</div>
<div class="tag">Your week, <em>curated.</em></div></div></section>
<section class="page back"><div class="safe">
<div class="info">
<div class="kicker">MEAL PLANNING FOR IPHONE</div>
<h2>Plan it, shop it,<br><em>cook it.</em></h2>
<p class="desc">A week of meals built around your calories, protein, allergies and budget, with one grocery list priced at your store.</p>
<div class="launch"><i></i>Coming to the App Store this November</div>
<div class="url">getprepnest.com</div>
<div class="mail">support@getprepnest.com</div>
</div>
<div class="qrbox"><div class="tile"><svg viewBox="0 0 {n} {n}" shape-rendering="crispEdges"><path d="{path}" fill="#13110E"/></svg></div>
<div class="scan">Scan to join the waitlist<small>Free for everyone</small></div></div>
</div></section></body></html>'''
open('card.html','w').write(html.replace('__GUIDES__',''))
open('card-guides.html','w').write(html.replace('__GUIDES__','guides'))
