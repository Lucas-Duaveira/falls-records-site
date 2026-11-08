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
  let youtubeApiPromise;

  const setStatus = (message) => {
    radioStatus.textContent = message;
  };

  const loadYouTubeApi = () => {
    if (window.YT?.Player) {
      return Promise.resolve();
    }

    if (youtubeApiPromise) {
      return youtubeApiPromise;
    }

    youtubeApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.addEventListener(
        "error",
        () => reject(new Error("Não foi possível carregar o player do YouTube.")),
        { once: true },
      );
      window.onYouTubeIframeAPIReady = resolve;
      document.head.append(script);
    });

    return youtubeApiPromise;
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

  const playTrack = async (trackIndex, shouldAnnounce = true) => {
    if (!active) {
      return;
    }

    currentTrackIndex = trackIndex % tracks.length;
    const track = tracks[currentTrackIndex];
    const announcementStatus = shouldAnnounce ? await announceTrack(track) : "";

    if (!active) {
      return;
    }

    setStatus(
      `${announcementStatus ? `${announcementStatus} ` : ""}Tocando ${track.title}, de ${track.artist}.`,
    );
    player.loadVideoById(track.videoId);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED && active) {
      void playTrack(currentTrackIndex + 1);
    }
  };

  radioToggle.addEventListener("click", async () => {
    if (active) {
      active = false;
      player?.stopVideo();
      window.speechSynthesis?.cancel();
      radioToggle.innerHTML = '<span aria-hidden="true">▶</span> OUVIR A RÁDIO';
      setStatus("Rádio pausada.");
      return;
    }

    if (!tracks.length) {
      setStatus("A seleção da rádio está vazia.");
      return;
    }

    active = true;
    radioToggle.innerHTML = '<span aria-hidden="true">■</span> PARAR A RÁDIO';
    setStatus("Conectando ao player do YouTube...");

    try {
      await loadYouTubeApi();
      if (!active) {
        return;
      }

      if (player) {
        await playTrack(currentTrackIndex, false);
        return;
      }

      player = new window.YT.Player(radioPlayerContainer, {
        height: "170",
        width: "100%",
        videoId: tracks[currentTrackIndex].videoId,
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (!active) {
              return;
            }
            setStatus(`Tocando ${tracks[currentTrackIndex].title}, de ${tracks[currentTrackIndex].artist}.`);
            player.playVideo();
          },
          onStateChange: onPlayerStateChange,
          onError: () => setStatus("O vídeo não pôde ser reproduzido. Tente a próxima faixa mais tarde."),
        },
      });
    } catch (error) {
      active = false;
      youtubeApiPromise = undefined;
      radioToggle.innerHTML = '<span aria-hidden="true">▶</span> OUVIR A RÁDIO';
      const message = error instanceof Error ? error.message : "Não foi possível iniciar a rádio.";
      setStatus(message);
    }
  });
}
