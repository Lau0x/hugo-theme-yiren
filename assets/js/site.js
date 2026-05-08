(() => {
  const themeToggle = document.querySelector(".theme-toggle");
  const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");

  const getStoredTheme = () => {
    const theme = localStorage.getItem("yu-theme");
    return theme === "dark" || theme === "light" ? theme : "";
  };

  const getEffectiveTheme = () => getStoredTheme() || (themeMedia.matches ? "dark" : "light");

  const applyTheme = (theme) => {
    if (theme === "dark" || theme === "light") {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("yu-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("yu-theme");
    }

    if (themeToggle) {
      const mode = getEffectiveTheme();
      const nextMode = mode === "dark" ? "浅色" : "深色";
      themeToggle.dataset.mode = mode;
      themeToggle.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
      themeToggle.setAttribute("aria-label", `切换到${nextMode}模式`);
      themeToggle.setAttribute("title", `切换到${nextMode}模式`);
    }
  };

  applyTheme(getStoredTheme());
  themeMedia.addEventListener("change", () => applyTheme(getStoredTheme()));
  themeToggle?.addEventListener("click", () => {
    applyTheme(getEffectiveTheme() === "dark" ? "light" : "dark");
  });

  document.querySelector(".site-header nav .is-active")?.scrollIntoView({
    behavior: "auto",
    block: "nearest",
    inline: "center",
  });

  const backToTop = document.querySelector(".back-to-top");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 360);
    };

    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
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

  const zoomableImages = document.querySelectorAll(".prose img, .gallery-image");

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
        zoomedImage.src = image.dataset.full || image.currentSrc || image.src;
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
    let isIndexReady = false;
    let searchTimer = 0;
    const indexUrl = results.dataset.index;

    const renderStatus = (message) => {
      results.innerHTML = `<div class="empty"><p>${escapeHtml(message)}</p></div>`;
    };

    fetch(indexUrl)
      .then((response) => response.json())
      .then((data) => {
        index = data;
        isIndexReady = true;
        if (input.value.trim()) {
          runSearch();
        }
      })
      .catch(() => {
        renderStatus("搜索索引加载失败，请刷新页面后再试。");
      });

    const render = (items, terms = []) => {
      if (!input.value.trim()) {
        renderStatus("输入关键词搜索文章。");
        return;
      }

      if (!items.length) {
        renderStatus("没有找到相关文章。");
        return;
      }

      results.innerHTML = items
        .map((item) => {
          const summary = item.summary || item.content || "";
          const tags = (item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
          return `<a class="search-result" href="${item.permalink}"><span class="search-result-meta">${escapeHtml(item.date || "")}${tags ? `<span class="search-result-tags">${tags}</span>` : ""}</span><h2>${highlightText(item.title, terms)}</h2><p>${highlightText(summary, terms)}</p></a>`;
        })
        .join("");
      results.insertAdjacentHTML("afterbegin", `<p class="search-summary">找到 ${items.length} 篇相关内容</p>`);
    };

    const scoreItem = (item, terms) => {
      const title = String(item.title || "").toLowerCase();
      const summary = String(item.summary || "").toLowerCase();
      const content = String(item.content || "").toLowerCase();
      const tags = (item.tags || []).join(" ").toLowerCase();

      let score = 0;
      for (const term of terms) {
        let termScore = 0;

        if (title.includes(term)) termScore += title === term ? 18 : 10;
        if (tags.includes(term)) termScore += 8;
        if (summary.includes(term)) termScore += 5;
        if (content.includes(term)) termScore += 2;

        if (!termScore) return 0;
        score += termScore;
      }

      return score;
    };

    const runSearch = () => {
      const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);

      if (!terms.length) {
        render([]);
        return;
      }

      if (!isIndexReady) {
        renderStatus("正在加载搜索索引...");
        return;
      }

      const matches = index
        .map((item) => {
          return { item, score: scoreItem(item, terms) };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map((entry) => entry.item);

      render(matches, terms);
    };

    renderStatus("输入关键词搜索文章。");
    input.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(runSearch, 120);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const firstResult = results.querySelector(".search-result");
        if (firstResult) {
          event.preventDefault();
          firstResult.click();
        }
      }
    });
  }

  function highlightText(value, terms) {
    const text = String(value || "");
    const pattern = terms.map(escapeRegExp).filter(Boolean).join("|");

    if (!pattern) {
      return escapeHtml(text);
    }

    return escapeHtml(text.replace(new RegExp(`(${pattern})`, "gi"), "\u0000$1\u0001"))
      .replace(/\u0000/g, "<mark>")
      .replace(/\u0001/g, "</mark>");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
