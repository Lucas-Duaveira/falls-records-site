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

const announcer = document.querySelector("[data-radio-announcer]");
const announcerStatus = announcer?.querySelector("[data-announcer-status]");
const announcerToggle = announcer?.querySelector("[data-announcer-toggle]");

if (
  announcer instanceof HTMLElement &&
  announcerStatus instanceof HTMLElement &&
  announcerToggle instanceof HTMLButtonElement
) {
  const welcomeText =
    "Olá! Seja bem-vindo à Rádio Falls Records. Aqui você encontra música independente " +
    "e artistas parceiros. Aperte play na playlist para ouvir. Falls Records: som em movimento.";

  const setAnnouncerState = (isSpeaking) => {
    announcerToggle.textContent = isSpeaking
      ? "■ PARAR APRESENTAÇÃO"
      : "▶ OUVIR BOAS-VINDAS";
    announcerToggle.setAttribute("aria-pressed", String(isSpeaking));
  };

  setAnnouncerState(false);

  announcerToggle.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
      announcerStatus.textContent =
        "A narração por voz não está disponível neste navegador.";
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setAnnouncerState(false);
      announcerStatus.textContent = "Apresentação pausada.";
      return;
    }

    const utterance = new SpeechSynthesisUtterance(welcomeText);
    utterance.lang = "pt-BR";
    utterance.onstart = () => {
      setAnnouncerState(true);
      announcerStatus.textContent = "A Rádio Falls dá as boas-vindas.";
    };
    utterance.onend = () => {
      setAnnouncerState(false);
      announcerStatus.textContent =
        "Agora é só apertar play na playlist para ouvir.";
    };
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }

      setAnnouncerState(false);
      announcerStatus.textContent =
        "Não foi possível reproduzir a apresentação por voz.";
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}
