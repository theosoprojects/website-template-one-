(function () {
  "use strict";

  var DEMO = {
    phone: "+14165550198",
    name: "Mara"
  };

  var STOPS = [
    { city: "Vancouver", dates: "2-5 December", note: "2–5 December. Open evenings. Reach out to arrange your time." },
    { city: "Calgary", dates: "11-13 December", note: "11–13 December. Two evenings left." },
    { city: "Montreal", dates: "8-11 January", note: "8–11 January. The city is open. Write ahead." },
    { city: "Ottawa", dates: "22-23 January", note: "22–23 January. Waitlist. Ask, and I will tell you if a time opens." }
  ];

  function smsHref(body) {
    return "sms:" + DEMO.phone + "?&body=" + encodeURIComponent(body);
  }

  function applySmsLinks() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-sms]"), function (el) {
      var body;
      if (el.getAttribute("data-sms") === "prebook") {
        body = "Hello " + DEMO.name + ", I would like to pre-book your " + el.getAttribute("data-city") + " dates (" + el.getAttribute("data-dates") + ").";
      } else {
        body = "Hello " + DEMO.name + ", I would like to ask about a booking. Date, duration, and incall or outcall.";
      }
      el.setAttribute("href", smsHref(body));
    });
  }

  function setYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function watchSections() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".rail-nav a"));
    if (!("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").slice(1);
      if (document.getElementById(id)) byId[id] = link;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var on = link === byId[entry.target.id];
          link.classList.toggle("is-active", on);
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    Object.keys(byId).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  function revealOnScroll() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("is-in"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function cycleStops() {
    var city = document.getElementById("stop-city");
    var note = document.getElementById("stop-note");
    var link = document.getElementById("stop-link");
    var card = document.getElementById("next-stop");
    if (!city || !note || !link || !card) return;
    var index = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    window.setInterval(function () {
      index = (index + 1) % STOPS.length;
      card.classList.add("is-fading");
      window.setTimeout(function () {
        var stop = STOPS[index];
        city.textContent = stop.city;
        note.textContent = stop.note;
        link.setAttribute("data-city", stop.city);
        link.setAttribute("data-dates", stop.dates);
        link.setAttribute("href", smsHref("Hello " + DEMO.name + ", I would like to pre-book your " + stop.city + " dates (" + stop.dates + ")."));
        card.classList.remove("is-fading");
      }, 420);
    }, 3800);
  }

  function runFilm() {
    var film = document.getElementById("film");
    var bar = document.getElementById("film-bar");
    if (!film || !bar) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paused = false;
    var last = 0;

    function paint() {
      var max = film.scrollWidth - film.clientWidth;
      var ratio = max > 0 ? film.scrollLeft / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0.08, ratio)) + ")";
    }

    function frame(now) {
      if (!paused && !reduce) {
        var delta = last ? now - last : 16;
        last = now;
        var max = film.scrollWidth - film.clientWidth;
        if (max > 0) {
          film.scrollLeft += delta * 0.04;
          if (film.scrollLeft >= max - 1) film.scrollLeft = 0;
        }
      } else {
        last = now;
      }
      paint();
      window.requestAnimationFrame(frame);
    }

    film.addEventListener("pointerenter", function () { paused = true; });
    film.addEventListener("pointerleave", function () { paused = false; });
    film.addEventListener("scroll", paint, { passive: true });
    film.addEventListener("focus", function () { paused = true; });
    film.addEventListener("blur", function () { paused = false; });
    window.requestAnimationFrame(frame);
  }

  document.documentElement.classList.add("js");
  applySmsLinks();
  setYear();
  watchSections();
  revealOnScroll();
  cycleStops();
  runFilm();
})();
