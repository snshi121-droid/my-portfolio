/* ============================================================
   أسامه العولقي — معرض أعمالي
   تفاعلات بسيطة: ظهور العناصر، تنقّل سلس، نسخ رقم الهاتف
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* السنة الحالية في التذييل */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* إظهار العناصر تدريجياً عند التمرير */
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* تنقّل سلس مع مراعاة ارتفاع الهيدر الثابت */
  const header = document.querySelector(".site-header");
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = header ? header.offsetHeight + 12 : 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: reduceMotion ? "auto" : "smooth"
      });

      if (history.replaceState) {
        history.replaceState(null, "", "#" + targetId);
      }
    });
  });

  /* إبراز رابط القسم الحالي أثناء التمرير */
  const navLinks = document.querySelectorAll(".site-nav__link");
  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* نسخ رقم الهاتف عند الضغط عليه */
  const phoneButton = document.getElementById("phone-copy");
  const phoneHint = document.getElementById("phone-hint");

  if (phoneButton && phoneHint) {
    const defaultHint = phoneHint.textContent;
    let resetTimer;

    function showHint(message) {
      phoneHint.textContent = message;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        phoneHint.textContent = defaultHint;
      }, 2200);
    }

    function fallbackCopy(text) {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(input);
      return copied;
    }

    phoneButton.addEventListener("click", async function () {
      const number = phoneButton.dataset.number || "";
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(number);
          copied = true;
        } catch (error) {
          copied = false;
        }
      }

      if (!copied) {
        copied = fallbackCopy(number);
      }

      showHint(copied ? "تم نسخ الرقم ✓" : "يمكنك الاتصال بالرقم مباشرة");
    });
  }
});
