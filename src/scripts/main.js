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
