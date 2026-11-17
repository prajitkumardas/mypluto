import { Instagram, Linkedin, X, type LucideIcon } from "lucide-react";

export type InsidePageFooterLink = {
  label: string;
  href: string;
};

export type InsidePageSocialIcon = {
  label: string;
  Icon: LucideIcon;
};

export const insidePageFooterLinks: readonly InsidePageFooterLink[] = [
  { label: "About", href: "/pluto" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Contact", href: "mailto:hello@plutofinds.com" }
];

export const insidePageSocialIcons: readonly InsidePageSocialIcon[] = [
  { label: "LinkedIn", Icon: Linkedin },
  { label: "X", Icon: X },
  { label: "Instagram", Icon: Instagram }
];
