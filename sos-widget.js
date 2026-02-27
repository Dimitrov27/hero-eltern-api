(function() {
  window.SOS_SECTIONS = [
    { key: "HALT", icon: "◉", color: "#C8432A", label: "Halt" },
    { key: "WAS GERADE PASSIERT IST", icon: "◎", color: "#8B6F5E", label: "Was gerade passiert ist" },
    { key: "KLEINE INNERE VERSCHIEBUNG", icon: "◈", color: "#6B8B7A", label: "Kleine innere Verschiebung" },
    { key: "SATZ FÜR JETZT", icon: "❝", color: "#C8432A", label: "Satz für jetzt" },
    { key: "EIN KLEINER SCHRITT HEUTE", icon: "→", color: "#8B6F5E", label: "Ein kleiner Schritt heute" },
  ];

  window.sosParseResponse = function(text) {
    const sections = [];
    for (let i = 0; i < SOS_SECTIONS.length; i++) {
      const current = SOS_SECTIONS[i].key;
      const next = SOS_SECTIONS[i + 1] ? SOS_SECTIONS[i + 1].key : null;
      const startIdx = text.indexOf(current);
      if (startIdx === -1) continue;
      const contentStart = startIdx + current.length;
      const endIdx = next ? text.indexOf(next, contentStart) : text.length;
      const content = text.slice(contentStart, endIdx > -1 ? endIdx : text.length)
        .replace(/^[\s:.\-–—]+/, "").trim();
      sections.push({ ...SOS_SECTIONS[i], content });
    }
    return sections;
  };

  window.sosHandleSubmit = async function() {
    const input = document.getElementById("sos-input").value.trim();
    if (!input) return;

    document.getElementById("sos-form").style.display = "none";
    document.getElementById("sos-loading").style.display = "block";
    document.getElementById("sos-error").style.display = "none";

    try {
      const res = await fetch("https://hero-eltern-api.pages.dev/sos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const text = data.text || "";

      const sections = sosParseResponse(text);
      const container = document.getElementById("sos-sections");
      container.innerHTML = "";

      if (sections.length > 0) {
        sections.forEach((s, i) => {
          const div = document.createElement("div");
          div.className = "sos-section" + (i === 0 ? " first" : "");
          div.style.animationDelay = (i * 0.08) + "s";
          div.innerHTML = '<div class="sos-section-label" style="color:' + s.color + '"><span>' + s.icon + '</span> ' + s.label + '</div><p class="sos-section-text' + (i === 3 ? ' highlight' : '') + '">' + s.content + '</p>';
          container.appendChild(div);
        });
      } else {
        container.innerHTML = '<p class="sos-section-text">' + text + '</p>';
      }

      if (/0800[\s\d]+/.test(text)) {
        document.getElementById("sos-crisis").style.display = "block";
      }

      document.getElementById("sos-loading").style.display = "none";
      document.getElementById("sos-result").style.display = "block";
      document.getElementById("sos-result").scrollIntoView({ behavior: "smooth" });

    } catch (e) {
      document.getElementById("sos-loading").style.display = "none";
      document.getElementById("sos-form").style.display = "block";
      document.getElementById("sos-error").style.display = "block";
    }
  };

  window.sosReset = function() {
    document.getElementById("sos-input").value = "";
    document.getElementById("sos-result").style.display = "none";
    document.getElementById("sos-crisis").style.display = "none";
    document.getElementById("sos-form").style.display = "block";
    document.getElementById("sos-input").focus();
  };
})();
