(() => {
  const backToTop = document.querySelector(".back-to-top");

  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 360);
    };

    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  document.querySelectorAll(".code-copy").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".code-block")?.querySelector("code")?.textContent || "";
      await navigator.clipboard.writeText(code);
      button.classList.add("copied");
      button.querySelector("span").textContent = "已复制";
      window.setTimeout(() => {
        button.classList.remove("copied");
        button.querySelector("span").textContent = "复制";
      }, 1400);
    });
  });

  const zoomableImages = document.querySelectorAll(".prose img");

  if (zoomableImages.length) {
    const overlay = document.createElement("button");
    const zoomedImage = document.createElement("img");
    let activeImage = null;
    let isClosing = false;

    overlay.type = "button";
    overlay.className = "image-zoom";
    overlay.setAttribute("aria-label", "关闭图片预览");
    zoomedImage.alt = "";
    overlay.appendChild(zoomedImage);
    document.body.appendChild(overlay);

    const preventScroll = (event) => {
      event.preventDefault();
    };

    const setImageRect = (rect) => {
      zoomedImage.style.width = `${rect.width}px`;
      zoomedImage.style.height = `${rect.height}px`;
      zoomedImage.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    };

    const getTargetRect = (image) => {
      const sourceRect = image.getBoundingClientRect();
      const margin = window.innerWidth <= 640 ? 16 : 32;
      const maxWidth = window.innerWidth - margin * 2;
      const maxHeight = window.innerHeight - margin * 2;
      const naturalWidth = image.naturalWidth || sourceRect.width;
      const naturalHeight = image.naturalHeight || sourceRect.height;
      const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
      const width = naturalWidth * ratio;
      const height = naturalHeight * ratio;

      return {
        width,
        height,
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
      };
    };

    const closeZoom = () => {
      if (!activeImage || isClosing) {
        return;
      }

      isClosing = true;
      setImageRect(activeImage.getBoundingClientRect());
      overlay.classList.remove("is-open");

      window.setTimeout(() => {
        if (!overlay.classList.contains("is-open")) {
          activeImage.classList.remove("is-zoom-source");
          overlay.classList.remove("is-visible", "is-animating");
          document.body.classList.remove("image-zoom-open");
          zoomedImage.removeAttribute("src");
          zoomedImage.alt = "";
          zoomedImage.removeAttribute("style");
          activeImage = null;
          isClosing = false;
        }
      }, 260);
    };

    zoomableImages.forEach((image) => {
      image.classList.add("is-zoomable");
      image.addEventListener("click", () => {
        if (activeImage || isClosing) {
          return;
        }

        activeImage = image;
        overlay.classList.remove("is-open", "is-animating");
        zoomedImage.src = image.currentSrc || image.src;
        zoomedImage.alt = image.alt || "";
        setImageRect(image.getBoundingClientRect());
        overlay.classList.add("is-visible");
        document.body.classList.add("image-zoom-open");
        zoomedImage.getBoundingClientRect();

        requestAnimationFrame(() => {
          image.classList.add("is-zoom-source");
          overlay.classList.add("is-animating");
          setImageRect(getTargetRect(image));
          overlay.classList.add("is-open");
        });
      });
    });

    overlay.addEventListener("click", closeZoom);
    overlay.addEventListener("wheel", preventScroll, { passive: false });
    overlay.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeZoom();
      }
    });
  }

  const input = document.querySelector("#search-input");
  const results = document.querySelector("#search-results");

  if (input && results) {
    let index = [];
    const indexUrl = results.dataset.index;

    fetch(indexUrl)
      .then((response) => response.json())
      .then((data) => {
        index = data;
      });

    const render = (items) => {
      if (!input.value.trim()) {
        results.innerHTML = "";
        return;
      }

      if (!items.length) {
        results.innerHTML = '<div class="empty"><p>没有找到相关文章。</p></div>';
        return;
      }

      results.innerHTML = items
        .map((item) => {
          const summary = item.summary || item.content || "";
          return `<a class="search-result" href="${item.permalink}"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(summary)}</p></a>`;
        })
        .join("");
    };

    input.addEventListener("input", () => {
      const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const matches = index
        .map((item) => {
          const haystack = `${item.title} ${item.summary} ${item.content} ${(item.tags || []).join(" ")}`.toLowerCase();
          const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
          return { item, score };
        })
        .filter((entry) => entry.score === terms.length)
        .slice(0, 20)
        .map((entry) => entry.item);

      render(matches);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  }
})();
