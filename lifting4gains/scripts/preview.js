(function () {
  "use strict";

  var money = function (c) { return "$" + (c / 100).toFixed(2); };

  /* ---- section switching ------------------------------------------------ */
  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-go]"));

  function show(id) {
    var found = false;
    views.forEach(function (v) {
      var on = v.id === "view-" + id;
      v.hidden = !on;
      if (on) found = true;
    });
    if (!found) return;
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.classList.toggle("is-on", a.getAttribute("data-go") === id);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  navLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var id = a.getAttribute("data-go");
      show(id);
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });

  show((location.hash || "#home").slice(1) || "home");

  /* ---- shop filters ----------------------------------------------------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip--btn"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("#shop-grid .card"));
  var countEl = document.getElementById("shop-count");
  var clearEl = document.getElementById("clear-filters");
  var active = { family: [], caffeine: [] };

  function applyFilters() {
    var shown = 0;
    cards.forEach(function (c) {
      var okFam = !active.family.length || active.family.indexOf(c.dataset.family) > -1;
      var okCaf = !active.caffeine.length || active.caffeine.indexOf(c.dataset.caffeine) > -1;
      var on = okFam && okCaf;
      c.hidden = !on;
      if (on) shown++;
    });
    countEl.textContent = shown + (shown === 1 ? " product" : " products");
    clearEl.hidden = !(active.family.length || active.caffeine.length);
  }

  chips.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.filter;
      var val = btn.dataset.value;
      var i = active[key].indexOf(val);
      if (i > -1) active[key].splice(i, 1); else active[key].push(val);
      btn.classList.toggle("is-on", i === -1);
      btn.setAttribute("aria-pressed", String(i === -1));
      applyFilters();
    });
    btn.setAttribute("aria-pressed", "false");
  });

  if (clearEl) {
    clearEl.addEventListener("click", function () {
      active.family = [];
      active.caffeine = [];
      chips.forEach(function (b) { b.classList.remove("is-on"); b.setAttribute("aria-pressed", "false"); });
      applyFilters();
    });
  }

  /* ---- product page: pack size + subscribe ------------------------------ */
  var packs = Array.prototype.slice.call(document.querySelectorAll(".pack"));
  var subToggle = document.getElementById("sub-toggle");
  var totalNow = document.getElementById("total-now");
  var totalWas = document.getElementById("total-was");
  var subPrice = document.getElementById("sub-price");
  var packPrice = 3499;

  function renderPrice() {
    var sub = subToggle && subToggle.checked;
    var eff = sub ? Math.round(packPrice * 0.85) : packPrice;
    totalNow.textContent = money(eff);
    totalWas.hidden = !sub;
    totalWas.textContent = money(packPrice);
    subPrice.textContent = money(Math.round(packPrice * 0.85)) + " every 4 weeks";
  }

  packs.forEach(function (p) {
    p.addEventListener("click", function () {
      packs.forEach(function (o) { o.classList.remove("is-on"); });
      p.classList.add("is-on");
      packPrice = parseInt(p.dataset.price, 10);
      renderPrice();
    });
  });
  if (subToggle) subToggle.addEventListener("change", renderPrice);
  if (totalNow) renderPrice();

  /* ---- bundle builder --------------------------------------------------- */
  var TIERS = [
    { min: 4, per: 349 },
    { min: 8, per: 319 },
    { min: 12, per: 292 },
    { min: 24, per: 271 }
  ];
  var MIN = 4, MAX = 36;
  var picked = {};
  var names = {};

  var rows = Array.prototype.slice.call(document.querySelectorAll(".picker li"));
  rows.forEach(function (li) {
    names[li.dataset.slug] = li.querySelector(".picker__n").textContent;
  });

  function tierFor(n) {
    var t = TIERS[0];
    TIERS.forEach(function (x) { if (n >= x.min) t = x; });
    return t;
  }
  function nextTier(n) {
    for (var i = 0; i < TIERS.length; i++) if (n < TIERS[i].min) return TIERS[i];
    return null;
  }

  function renderBundle() {
    var count = 0;
    Object.keys(picked).forEach(function (k) { count += picked[k]; });

    var tier = tierFor(count);
    var next = nextTier(count);
    var subtotal = count * tier.per;
    var saving = Math.max(0, count * TIERS[0].per - subtotal);
    var valid = count >= MIN && count <= MAX;

    document.getElementById("b-count").textContent = count + " / " + MAX;
    document.getElementById("b-bar").style.width = Math.min(100, (count / 24) * 100) + "%";
    document.getElementById("b-per").textContent = money(tier.per);
    document.getElementById("b-total").textContent = money(subtotal);

    var savingRow = document.getElementById("b-saving");
    savingRow.hidden = saving <= 0;
    document.getElementById("b-save").textContent = "−" + money(saving);

    document.getElementById("b-hint").textContent =
      count < MIN ? "Add " + (MIN - count) + " more to reach the " + MIN + "-can minimum."
      : next ? "Add " + (next.min - count) + " more and every can drops to " + money(next.per) + "."
      : "You're at our best per-can price.";

    var list = document.getElementById("b-list");
    var keys = Object.keys(picked).filter(function (k) { return picked[k] > 0; });
    list.innerHTML = keys.length
      ? keys.map(function (k) { return "<li><span>" + names[k] + "</span><span class='mono'>×" + picked[k] + "</span></li>"; }).join("")
      : "<li class='dim'>Nothing picked yet.</li>";

    var addBtn = document.getElementById("b-add");
    addBtn.disabled = !valid;
    addBtn.className = "btn btn--full " + (valid ? "btn--primary" : "btn--ghost");
    addBtn.textContent = valid ? "Add pack to cart" : "Minimum " + MIN + " cans";

    rows.forEach(function (li) {
      var n = picked[li.dataset.slug] || 0;
      li.querySelector(".qty").textContent = String(n);
      li.classList.toggle("has", n > 0);
      li.querySelector("[data-step='-1']").disabled = n === 0;
      li.querySelector("[data-step='1']").disabled = count >= MAX;
    });
  }

  rows.forEach(function (li) {
    li.querySelectorAll("[data-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = li.dataset.slug;
        var delta = parseInt(btn.dataset.step, 10);
        var total = 0;
        Object.keys(picked).forEach(function (k) { total += picked[k]; });
        if (delta > 0 && total >= MAX) return;
        picked[slug] = Math.max(0, (picked[slug] || 0) + delta);
        renderBundle();
      });
    });
  });

  document.querySelectorAll(".preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var slugs = btn.dataset.preset.split(",");
      var per = Math.floor(12 / slugs.length);
      var rem = 12 - per * slugs.length;
      picked = {};
      slugs.forEach(function (s, i) { picked[s] = per + (i < rem ? 1 : 0); });
      renderBundle();
    });
  });

  if (document.getElementById("b-total")) renderBundle();

  /* ---- demo-only controls ----------------------------------------------- */
  function flash(el, msg) {
    var original = el.textContent;
    el.textContent = msg;
    el.disabled = true;
    setTimeout(function () { el.textContent = original; el.disabled = false; }, 2200);
  }

  document.querySelectorAll("[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      flash(form.querySelector("button"), "Needs the server");
    });
  });

  document.querySelectorAll("[data-demo-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () { flash(btn, "Cart needs the server"); });
  });

  document.getElementById("b-add").addEventListener("click", function () {
    flash(document.getElementById("b-add"), "Cart needs the server");
  });
})();
