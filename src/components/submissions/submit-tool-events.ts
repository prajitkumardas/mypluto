export const SUBMIT_TOOL_OPEN_EVENT = "pluto:open-submit-tool";

export function requestSubmitToolModal() {
  window.dispatchEvent(new CustomEvent(SUBMIT_TOOL_OPEN_EVENT));
}
