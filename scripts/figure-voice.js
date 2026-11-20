// Both versions remain readable when this enhancement does not run.
export function mountVoice(host) {
  const versions = [...host.querySelectorAll("[data-voice-version]")];
  const body = host.querySelector(".voice-compare__versions");
  if (!body || versions.length !== 2 || host.querySelector("[data-voice-controls]")) return false;

  const controls = document.createElement("div");
  controls.className = "voice-compare__controls";
  controls.dataset.voiceControls = "";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Choose which wording to read");
  const choices = [["before", "AI draft"], ["after", "In your own words"], ["both", "Compare both"]];
  for (const [value, label] of choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.textContent = label;
    button.dataset.voiceChoice = value;
    button.setAttribute("aria-pressed", String(value === "both"));
    button.addEventListener("click", () => {
      for (const version of versions) version.hidden = value !== "both" && version.dataset.voiceVersion !== value;
      for (const choice of controls.querySelectorAll("button")) {
        choice.setAttribute("aria-pressed", String(choice === button));
      }
    });
    controls.append(button);
  }
  host.insertBefore(controls, body);
  return true;
}
