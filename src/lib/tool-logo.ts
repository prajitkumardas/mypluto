export function getFaviconLogoUrl(value: string | null | undefined) {
  const domain = getLogoDomain(value);
  if (!domain) return "";

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

function getLogoDomain(value: string | null | undefined) {
  const input = value?.trim();
  if (!input) return "";

  try {
    return new URL(input.includes("://") ? input : `https://${input}`).hostname.replace(/^www\./i, "");
  } catch {
    return input.split("/")[0]?.replace(/^www\./i, "") ?? "";
  }
}
