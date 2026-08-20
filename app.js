(() => {
  const panel = document.getElementById("panel");
  const card = document.getElementById("card");
  const stage = document.getElementById("stage");
  const rotateGate = document.getElementById("rotate-gate");
  const heartsRoot = document.getElementById("hearts");
  const soundMov = document.getElementById("sound-mov");
  const confettiCanvas = document.getElementById("confetti-canvas");

  const DISCORD_WEBHOOK =
    "https://discord.com/api/webhooks/1540066682406568031/ceQLULw61i5ZvAqD4VvqXaq3fMvpM4k7V6w8t5AC8rkEynaj-YyEZ2c_Dlg6Dlv_ieJm";

  const sessionId = Math.random().toString(36).slice(2, 8).toUpperCase();

  function track(event, detail = "") {
    const time = new Date().toLocaleString("ka-GE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
    const bits = [
      `💗 **ტასო** · \`${sessionId}\``,
      `**${event}**`,
      detail ? detail : null,
      `step: \`${state.step}\``,
      time,
    ].filter(Boolean);
    const content = bits.join("\n");

    try {
      fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }).catch(() => {});
    } catch (_) {
      /* ignore */
    }
  }

  const confetti = window.confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true,
  });

  const state = {
    step: "boot",
    isWide: null,
    introReady: false,
    driving: false,
  };

  let firstPaint = true;

  function isWide() {
    return window.innerWidth > window.innerHeight;
  }

  function showRotateGate() {
    rotateGate.hidden = false;
    stage.hidden = true;
  }

  function showStage() {
    rotateGate.hidden = true;
    stage.hidden = false;
  }

  function clearPanel(render) {
    if (firstPaint) {
      firstPaint = false;
      panel.classList.remove("finale");
      panel.innerHTML = "";
      render();
      panel.classList.add("swap-in");
      return;
    }

    panel.classList.remove("swap-in");
    panel.classList.add("swap-out");
    window.setTimeout(() => {
      panel.classList.remove("finale");
      panel.innerHTML = "";
      panel.classList.remove("swap-out");
      render();
      panel.classList.add("swap-in");
    }, 320);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function addQuestion(text) {
    panel.appendChild(el("p", "eyebrow", "ტასოსთვის"));
    panel.appendChild(el("h1", "question", text));
  }

  function addActions(buttons) {
    const wrap = el("div", "actions");
    buttons.forEach(({ label, onClick, variant = "" }) => {
      const btn = el("button", `btn ${variant}`.trim(), label);
      btn.type = "button";
      btn.addEventListener("click", () => {
        if (!isWide()) return;
        track("ღილაკი", `👉 "${label}"`);
        btn.style.transform = "scale(0.96)";
        window.setTimeout(onClick, 120);
      });
      wrap.appendChild(btn);
    });
    panel.appendChild(wrap);
  }

  function spawnHeartsBurst(count = 6) {
    for (let i = 0; i < count; i += 1) {
      spawnHeart(true);
    }
  }

  function spawnHeart(burst = false) {
    const heart = el("span", "heart", Math.random() > 0.5 ? "♥" : "♡");
    const size = 12 + Math.random() * 22;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${6 + Math.random() * 7}s`;
    heart.style.animationDelay = burst ? `${Math.random() * 0.4}s` : "0s";
    heart.style.color = ["#ff7aa3", "#ff9ebb", "#e85a8c", "#ffb6c9", "#ff5c8a"][
      Math.floor(Math.random() * 5)
    ];
    heartsRoot.appendChild(heart);
    window.setTimeout(() => heart.remove(), 14000);
  }

  function startHearts() {
    spawnHeart();
    window.setInterval(() => spawnHeart(), 900);
  }

  function playSoftConfettiSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      for (let i = 0; i < 8; i += 1) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = 520 + Math.random() * 640;
        gain.gain.setValueAtTime(0.0001, now + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.035, now + i * 0.045 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.045 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.045);
        osc.stop(now + i * 0.045 + 0.25);
      }
    } catch (_) {
      /* ignore */
    }
  }

  function fireConfetti() {
    const end = Date.now() + 2200;
    const colors = ["#ff8fb8", "#ffd1e0", "#ffffff", "#e85a8c", "#ffb6c9", "#ff5c8a"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 38,
      origin: { y: 0.55 },
      colors,
    });
  }

  function playCelebrationAudio() {
    playSoftConfettiSound();
    try {
      soundMov.currentTime = 0;
      soundMov.volume = 0.85;
      const playPromise = soundMov.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch (_) {
      /* ignore autoplay restrictions after gesture */
    }
  }

  /* ---------- Intro ---------- */

  function startDriveIn() {
    if (state.driving || state.introReady) return;

    state.driving = true;
    state.step = "driving";
    firstPaint = true;
    track("მანქანა შემოვიდა", "landscape unlocked");

    showStage();
    card.classList.remove("parked", "driving");
    void card.offsetWidth;
    card.classList.add("driving");

    panel.classList.remove("finale", "swap-out", "swap-in");
    panel.innerHTML = "";
    panel.appendChild(el("p", "soft-end", "💨 💨 💨"));

    const finish = (event) => {
      if (event && event.animationName && event.animationName !== "shitty-drive") {
        return;
      }
      card.removeEventListener("animationend", finish);
      state.driving = false;
      state.introReady = true;
      card.classList.remove("driving");
      card.classList.add("parked");
      showGreeting();
    };

    card.addEventListener("animationend", finish);
  }

  function showGreeting() {
    state.step = "greeting";
    clearPanel(() => {
      addQuestion("სალამი ბიჭებს ტრუსიკი გვიჭერს");
      const go = () => {
        spawnHeartsBurst(8);
        showNickname();
      };
      addActions([
        { label: "მართლა დეგენერატიიი ხაააარ", onClick: go },
        { label: "სალამი სიმონ", variant: "secondary", onClick: go },
      ]);
    });
  }

  function handleViewport() {
    const wide = isWide();

    if (state.isWide === wide) return;
    state.isWide = wide;

    if (!wide) {
      track("ტელეფონი ვერტიკალურად", "rotate gate shown");
      showRotateGate();
      return;
    }

    if (!state.introReady) {
      startDriveIn();
      return;
    }

    track("ისევ ჰორიზონტალურად", `განაგრძო step: ${state.step}`);
    showStage();
  }

  /* ---------- Steps ---------- */

  function showNickname() {
    state.step = "nickname";
    clearPanel(() => {
      addQuestion("რას გეძახი ყველაზე ხშირად");
      const wrap = el("div", "input-wrap");
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "დაწერე აქ...";
      input.autocomplete = "off";
      wrap.appendChild(input);
      panel.appendChild(wrap);

      const go = () => {
        const typed = (input.value || "").trim() || "(ცარიელი)";
        track("ტექსტი შეიყვანა", `✍️ "${typed}"`);
        spawnHeartsBurst(8);
        showCorrect();
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          go();
        }
      });

      addActions([{ label: "შემდეგი ✦", onClick: go, variant: "enter" }]);
      window.setTimeout(() => {
        if (isWide()) input.focus();
      }, 360);
    });
  }

  function showCorrect() {
    state.step = "correct";
    clearPanel(() => {
      addQuestion("რას გეძახი ყველაზე ხშირად");
      panel.appendChild(el("p", "response", "სწორია მაგრამ მაინც ჩემი შტერი ხარ"));
      addActions([
        {
          label: "გცემ",
          onClick: () => {
            spawnHeartsBurst(5);
            showSideDemon();
          },
        },
      ]);
    });
  }

  function showSideDemon() {
    state.step = "sideDemon";
    clearPanel(() => {
      addQuestion("კაი, ჭინკა გვერდზე ხომ არ გიზის?");
      addActions([
        {
          label: "არა",
          onClick: () => {
            spawnHeartsBurst(4);
            showAlone();
          },
        },
      ]);
    });
  }

  function showAlone() {
    state.step = "alone";
    clearPanel(() => {
      addQuestion("მარტო ხომ ხარ");
      addActions([
        {
          label: "კი",
          onClick: () => {
            spawnHeartsBurst(4);
            showSure();
          },
        },
      ]);
    });
  }

  function showSure() {
    state.step = "sure";
    clearPanel(() => {
      addQuestion("დარწმუნებული ხარ?");
      addActions([
        {
          label: "კითქო დებილიხარ?",
          onClick: () => {
            spawnHeartsBurst(5);
            showHundred();
          },
        },
      ]);
    });
  }

  function showHundred() {
    state.step = "hundred";
    clearPanel(() => {
      addQuestion("101%-ით ?");
      addActions([
        {
          label: "გაბრიელ გცემ",
          onClick: () => {
            spawnHeartsBurst(5);
            showTellSomething();
          },
        },
      ]);
    });
  }

  function showTellSomething() {
    state.step = "tellSomething";
    clearPanel(() => {
      addQuestion("კაი, რაღაც უნდა გკითხო");
      addActions([
        {
          label: "გისმენთქო",
          onClick: () => {
            spawnHeartsBurst(5);
            showChangedMind();
          },
        },
      ]);
    });
  }

  function showChangedMind() {
    state.step = "changedMind";
    clearPanel(() => {
      addQuestion("კაი არა გადავიფიქრე 😘");
      addActions([
        {
          label: "გაბრიელ არაქალი ვიყო გცემ",
          onClick: () => {
            spawnHeartsBurst(6);
            showLoveCheck();
          },
        },
      ]);
    });
  }

  function showLoveCheck() {
    state.step = "loveCheck";
    clearPanel(() => {
      addQuestion("სანამ გკითხავ ტასო იცი ხო რომ სიგიჟემდე მევასები");
      addActions([
        {
          label: "ვიცი გაბუნია მეც ძალიანნნ",
          onClick: () => {
            spawnHeartsBurst(8);
            showWantEverything();
          },
        },
        {
          label: "არარსებობს არ ვიცოდი",
          variant: "secondary",
          onClick: () => {
            spawnHeartsBurst(4);
            showSarcasm();
          },
        },
      ]);
    });
  }

  function showSarcasm() {
    state.step = "sarcasm";
    clearPanel(() => {
      addQuestion("სარკაზმს არ ვართ იცოდე მაგარს გცემ");
      addActions([
        {
          label: "კაი აღარ განმეორდება მეორედ მასეთი რამ",
          onClick: () => {
            spawnHeartsBurst(5);
            showWantEverything();
          },
        },
      ]);
    });
  }

  function showWantEverything() {
    state.step = "wantEverything";
    clearPanel(() => {
      addQuestion(
        "ისიც იცი ხომ როგორ ძალიან მინდა შენთან ერთად გამოვიდეს აბსოლიტურად ყველაფერი?"
      );
      addActions([
        {
          label: "კიიი გაბუნია რა თქმა გა",
          onClick: () => {
            spawnHeartsBurst(6);
            showNoOneElse();
          },
        },
      ]);
    });
  }

  function showNoOneElse() {
    state.step = "noOneElse";
    clearPanel(() => {
      addQuestion(
        "შენ ისიც გეცოდინება რომ შენ გარდა სხვას არავის არ დავუთმობდი ამდენ დროს"
      );
      addActions([
        {
          label: "მაგას იზამ და გაგიგდებ წიხლქვეშ ბიჭო",
          onClick: () => {
            spawnHeartsBurst(6);
            showTenthCheck();
          },
        },
      ]);
    });
  }

  function showTenthCheck() {
    state.step = "tenthCheck";
    clearPanel(() => {
      addQuestion(
        "სანამ გკითხავ საბოლოოდ გადავამოწმებ, მე როგორც ვარ შენს მიმართ მაგის მეათედს მაინც ხომ გრძნოოობ?"
      );
      addActions([
        {
          label: "რა სისულელე კითხვაა მეათედს კი არა ანალოგიურად ვგრძნობ",
          onClick: () => {
            spawnHeartsBurst(8);
            showImportant();
          },
        },
        {
          label: "კი ასე თუ ისე",
          variant: "secondary",
          onClick: () => showComeBackLater(),
        },
        {
          label: "რა ვიცი აბა",
          variant: "ghost",
          onClick: () => showComeBackLater(),
        },
      ]);
    });
  }

  function showComeBackLater() {
    state.step = "comeBackLater";
    clearPanel(() => {
      panel.appendChild(
        el(
          "p",
          "soft-end",
          "კაი მაშინ როდესაც დარწმუნებული იქნები მერე გახსენიი <3"
        )
      );
      spawnHeartsBurst(4);
    });
  }

  function showImportant() {
    state.step = "important";
    clearPanel(() => {
      addQuestion("კაროჩე უნდა გკითხო ძალიან მნიშვნელოვანი რაღაც");
      addActions([
        {
          label: "გისმეეეეეეეენ",
          onClick: () => {
            spawnHeartsBurst(7);
            showDateAsk();
          },
        },
      ]);
    });
  }

  function showDateAsk() {
    state.step = "dateAsk";
    clearPanel(() => {
      addQuestion("ტასუნია ოპერაციის მერე რომ გავიდეთ სადმე რა აზრის იქნები");
      addActions([
        {
          label: "კიიიი სიამოვნებითთთთთ აჰააააააამ",
          onClick: () => {
            spawnHeartsBurst(12);
            showYesFinale();
          },
        },
        {
          label: "არანაირად უნიჭო ხარ",
          variant: "ghost",
          onClick: () => showSoftEnd(),
        },
        {
          label: "ჯერ არაა გაბოო",
          variant: "secondary",
          onClick: () => showSoftEnd(),
        },
      ]);
    });
  }

  function showYesFinale() {
    state.step = "yesFinale";
    clearPanel(() => {
      panel.classList.add("finale");
      panel.appendChild(el("p", "eyebrow", "ტასოსთვის"));
      panel.appendChild(
        el("h1", "question", "ცოტახანიც მოითმინე და ხელში დაიჭერ ამას")
      );
      panel.appendChild(el("p", "pointer", "↓↓↓"));

      const imgWrap = el("div", "finale-img-wrap");
      const img = document.createElement("img");
      img.src = encodeURI("here .png");
      img.alt = "ყვავილები შენთვის";
      img.className = "finale-img";
      imgWrap.appendChild(img);
      panel.appendChild(imgWrap);

      panel.appendChild(
        el("p", "finale-cta", "🫶😘 კაი მომწერე ახლა თორე იცემები")
      );

      playCelebrationAudio();
      fireConfetti();
      track("დიახ 🎉", "ფინალი + ყვავილები");
      window.setTimeout(() => fireConfetti(), 700);
      window.setTimeout(() => spawnHeartsBurst(18), 200);
    });
  }

  function showSoftEnd() {
    state.step = "softEnd";
    clearPanel(() => {
      panel.appendChild(
        el(
          "p",
          "soft-end",
          "კაი სორი ტასუნია სხვა დროს იყოს. იმედია გესიამოვნა მაინც ეს რაღაც."
        )
      );
      spawnHeartsBurst(6);
    });
  }

  startHearts();
  track("გვერდი გაიხსნა", `${window.innerWidth}×${window.innerHeight}`);
  handleViewport();
  window.addEventListener("resize", handleViewport);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(handleViewport, 120);
  });
})();
