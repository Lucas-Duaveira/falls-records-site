document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
  yearElement.textContent = String(new Date().getFullYear());
});

const mailingForm = document.querySelector("[data-mailing-form]");
const mailingNote = document.querySelector("[data-mailing-note]");

if (mailingForm instanceof HTMLFormElement && mailingNote instanceof HTMLElement) {
  mailingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    mailingNote.textContent =
      "A lista ainda não está conectada nesta prévia. Nenhum e-mail foi enviado.";
  });
}

const radioPanel = document.querySelector("[data-radio]");
const radioStatus = radioPanel?.querySelector("[data-radio-status]");
const radioToggle = radioPanel?.querySelector("[data-radio-toggle]");
const radioPlayerContainer = radioPanel?.querySelector("[data-radio-player]");

if (
  radioPanel instanceof HTMLElement &&
  radioStatus instanceof HTMLElement &&
  radioToggle instanceof HTMLButtonElement &&
  radioPlayerContainer instanceof HTMLElement
) {
  const apiEndpoint = radioPanel.dataset.aiEndpoint ?? "";
  const tracks = JSON.parse(radioPanel.dataset.radioTracks ?? "[]");
  let player;
  let active = false;
  let currentTrackIndex = 0;

  const setStatus = (message) => {
    radioStatus.textContent = message;
  };

  const loadYouTubeApi = () =>
    new Promise((resolve, reject) => {
      if (window.YT?.Player) {
        resolve(window.YT);
        return;
      }

      const script =
        document.querySelector('script[src="https://www.youtube.com/iframe_api"]') ??
        document.createElement("script");
      const cleanup = () => {
        window.clearTimeout(timeoutId);
        script.removeEventListener("error", onError);
      };
      const onError = () => {
        cleanup();
        reject(new Error("A API do YouTube não carregou. Use o botão de reprodução no vídeo."));
      };
      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error("O YouTube está demorando para responder. Use o botão de reprodução no vídeo."));
      }, 12000);
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        cleanup();
        resolve(window.YT);
      };
      script.addEventListener("error", onError, { once: true });

      if (!script.isConnected) {
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.append(script);
      }
    });

  const setButtonState = (isActive) => {
    radioToggle.textContent = isActive ? "■ PARAR A RÁDIO" : "▶ OUVIR A RÁDIO";
    radioToggle.setAttribute("aria-pressed", String(isActive));
  };

  const announceTrack = async (track) => {
    if (!apiEndpoint) {
      return "Apresentador de IA aguardando configuração.";
    }

    setStatus(`O apresentador está preparando a chamada para ${track.title}...`);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id }),
      });

      if (!response.ok) {
        throw new Error(`O serviço de IA respondeu com o erro ${response.status}.`);
      }

      const result = await response.json();
      if (typeof result.line !== "string" || result.line.length === 0) {
        throw new Error("O serviço de IA retornou uma chamada inválida.");
      }

      if (!active) {
        return;
      }

      if (!("speechSynthesis" in window)) {
        return "Seu navegador não oferece narração por voz.";
      }

      await new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(result.line);
        utterance.lang = "pt-BR";
        utterance.onend = resolve;
        utterance.onerror = () => reject(new Error("Não foi possível reproduzir a chamada de voz."));
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      });
      return "";
    } catch (error) {
      if (!active) {
        return "";
      }

      const message = error instanceof Error ? error.message : "Erro inesperado no apresentador de IA.";
      return `${message} A música vai começar sem a chamada.`;
    }
  };

  const playTrack = (trackIndex, shouldAnnounce = false) => {
    if (!active) {
      return;
    }

    currentTrackIndex = trackIndex % tracks.length;
    const track = tracks[currentTrackIndex];
    const startTrack = (announcementStatus = "") => {
      if (!active || currentTrackIndex !== trackIndex % tracks.length) {
        return;
      }

      setStatus(
        `${announcementStatus ? `${announcementStatus} ` : ""}Tocando ${track.title}, de ${track.artist}.`,
      );
      player.loadVideoById(track.videoId);
    };

    if (shouldAnnounce) {
      void announceTrack(track).then(startTrack);
    } else {
      startTrack();
    }
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING && active) {
      const track = tracks[currentTrackIndex];
      setStatus(`Tocando ${track.title}, de ${track.artist}.`);
    } else if (event.data === window.YT.PlayerState.ENDED && active) {
      playTrack(currentTrackIndex + 1, true);
    }
  };

  radioToggle.setAttribute("aria-pressed", "false");
  radioToggle.addEventListener("click", () => {
    if (active) {
      active = false;
      if (player) {
        player.stopVideo();
      } else {
        radioPlayerContainer.replaceChildren();
      }
      window.speechSynthesis?.cancel();
      setButtonState(false);
      setStatus("Rádio pausada.");
      return;
    }

    if (!tracks.length) {
      setStatus("A seleção da rádio está vazia.");
      return;
    }

    active = true;
    setButtonState(true);
    setStatus("Abrindo o player. Se a música não iniciar, aperte Play no vídeo.");

    radioPlayerContainer.replaceChildren();
    const iframe = document.createElement("iframe");
    const currentTrack = tracks[currentTrackIndex];
    iframe.title = `${currentTrack.title} — ${currentTrack.artist}`;
    iframe.width = "100%";
    iframe.height = "170";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src =
      `https://www.youtube-nocookie.com/embed/${encodeURIComponent(currentTrack.videoId)}` +
      "?autoplay=1&enablejsapi=1&playsinline=1&rel=0" +
      `&origin=${encodeURIComponent(window.location.origin)}`;
    radioPlayerContainer.append(iframe);

    void loadYouTubeApi()
      .then(
        (youtube) =>
          new Promise((resolve, reject) => {
            if (!active || player) {
              resolve();
              return;
            }

            try {
              player = new youtube.Player(iframe, {
                events: {
                  onReady: () => {
                    if (active) {
                      setStatus(
                        `Player pronto para ${tracks[currentTrackIndex].title}. Se não tocar, aperte Play no vídeo.`,
                      );
                    }
                    resolve();
                  },
                  onStateChange: onPlayerStateChange,
                  onError: (event) => {
                    if (active) {
                      setStatus(
                        `O YouTube não conseguiu reproduzir esta faixa (erro ${event.data}). Confira se o vídeo permite reprodução incorporada.`,
                      );
                    }
                    resolve();
                  },
                },
              });
            } catch (error) {
              reject(error);
            }
          }),
      )
      .catch((error) => {
        if (active) {
          const message =
            error instanceof Error ? error.message : "Não foi possível carregar o player do YouTube.";
          setStatus(`${message} A faixa ainda pode ser iniciada pelo player do vídeo.`);
        }
      });
  });
}
