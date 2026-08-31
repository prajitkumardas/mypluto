import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Code2,
  ExternalLink,
  FileCheck2,
  Globe2,
  Layers3,
  Link2,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  XCircle
} from "lucide-react";
import { ToolDetailActions } from "@/components/tools/tool-detail-actions";
import { ToolLogo } from "@/components/shared/tool-logo";
import { CompareButton } from "@/components/compare/compare-button";
import { getFaviconLogoUrl } from "@/lib/tool-logo";
import { cn } from "@/lib/utils";
import styles from "./tool-detail-view.module.css";

export type ToolDetailTone = "success" | "warning" | "neutral" | "danger";

export type ToolDetailSource = {
  domain: string;
  href?: string;
  official: boolean;
  title: string;
  type: string;
};

export type ToolDetailAlternative = {
  category: string;
  href: string;
  logoUrl?: string | null;
  name: string;
  slug: string;
};

export type ToolDetailViewModel = {
  api: string;
  bestFor: string[];
  breadcrumb: Array<{ href?: string; label: string }>;
  capabilities: string[];
  category: string;
  chips: string[];
  commercialUse: string;
  company: string;
  confidence: string;
  confidenceTone: ToolDetailTone;
  description: string;
  domain: string;
  freePlan: string;
  href: string;
  integrations: string[];
  lastChecked: string;
  limitations: string[];
  logoUrl?: string | null;
  name: string;
  officialUrl: string;
  platforms: string[];
  pricing: string;
  pricingDetail: string;
  privacy: string;
  similarTools: ToolDetailAlternative[];
  slug: string;
  sourceCountLabel: string;
  sources: ToolDetailSource[];
  strengths: string[];
  subcategory: string;
  verificationStatus: string;
  verificationTone: ToolDetailTone;
  websiteStatus: string;
  websiteTone: ToolDetailTone;
};

export function ToolDetailView({ tool }: { tool: ToolDetailViewModel }) {
  const details = [
    { icon: CircleDollarSign, label: "Pricing", value: tool.pricing },
    { icon: BadgeCheck, label: "Free plan", value: tool.freePlan },
    { icon: Users, label: "Best for", value: listText(tool.bestFor, 2) },
    { icon: MonitorSmartphone, label: "Platforms", value: listText(tool.platforms, 3) },
    { icon: Code2, label: "API", value: tool.api },
    { icon: Link2, label: "Integrations", value: listText(tool.integrations, 3) }
  ];
  const quickFacts = [
    ["Category", tool.category],
    ["Company", tool.company],
    ["Website", tool.domain],
    ["Pricing", tool.pricing],
    ["Free plan", tool.freePlan],
    ["Platforms", listText(tool.platforms, 3)],
    ["Commercial use", tool.commercialUse]
  ];
  const trustFacts = [
    ["Verification", tool.verificationStatus],
    ["Last checked", tool.lastChecked],
    ["Website", tool.websiteStatus],
    ["Sources", tool.sourceCountLabel],
    ["Data confidence", tool.confidence]
  ];
  const capabilities = tool.capabilities.slice(0, 6);

  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.shell}>
        <Breadcrumb items={tool.breadcrumb} />

        <section className={styles.hero} aria-labelledby="tool-title">
          <ToolLogo className={styles.logo} imageClassName={styles.logoImage} name={tool.name} src={tool.logoUrl} />
          <div className={styles.identity}>
            <StatusPill label={tool.verificationStatus} tone={tool.verificationTone} />
            <h1 id="tool-title">{tool.name}</h1>
            <p>{tool.description}</p>
            <div className={styles.chips}>
              {tool.chips.slice(0, 3).map((chip) => <span key={chip}>{chip}</span>)}
            </div>
            <dl className={styles.heroMeta}>
              <Meta icon={Layers3} label="Category" value={tool.category} />
              <Meta icon={Globe2} label="Website" value={tool.domain} href={tool.officialUrl} />
              <Meta icon={Users} label="Company" value={tool.company} />
              <Meta icon={CalendarDays} label="Checked" value={tool.lastChecked} />
            </dl>
          </div>
          <ToolDetailActions officialUrl={tool.officialUrl} toolName={tool.name} toolSlug={tool.slug} />
        </section>

        <section className={styles.trustStrip} aria-label="Verification summary">
          <TrustItem icon={ShieldCheck} label={tool.verificationStatus} tone={tool.verificationTone} detail="Official checks where available" />
          <TrustItem icon={Globe2} label={tool.websiteStatus} tone={tool.websiteTone} detail={tool.domain} />
          <TrustItem icon={CalendarDays} label={tool.lastChecked} tone="neutral" detail="Last checked" />
          <TrustItem icon={FileCheck2} label={tool.sourceCountLabel} tone={tool.confidenceTone} detail={`${tool.confidence} confidence`} />
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <section className={cn(styles.card, styles.takeCard)}>
              <div className={styles.sectionTitleRow}>
                <Star aria-hidden="true" />
                <h2>Pluto&apos;s Take</h2>
              </div>
              <p>{buildTake(tool)}</p>
              <div className={styles.takeNotes}>
                <span><CheckCircle2 aria-hidden="true" />Best suited for: {listText(tool.bestFor, 3)}</span>
                <span><AlertTriangle aria-hidden="true" />Keep in mind: {tool.limitations[0] || "Verify important claims on the official website."}</span>
              </div>
            </section>

            <section className={styles.card}>
              <SectionHeading title="Key details" />
              <div className={styles.factGrid}>
                {details.map((item) => <DetailFact key={item.label} {...item} />)}
              </div>
              <p className={styles.freshness}>Pricing last checked: {tool.lastChecked}. Verify current plan terms on the official site.</p>
            </section>

            {capabilities.length > 0 ? (
              <section className={styles.card}>
                <SectionHeading title="Key capabilities" />
                <div className={styles.capabilityGrid}>
                  {capabilities.map((capability) => <Capability key={capability} label={capability} />)}
                </div>
              </section>
            ) : null}

            <section className={styles.card}>
              <SectionHeading title="Strengths and limitations" />
              <div className={styles.balanceGrid}>
                <PointList items={tool.strengths} tone="success" title="Strengths" />
                <PointList items={tool.limitations} tone="warning" title="Limitations" />
              </div>
            </section>

            <section className={styles.card}>
              <SectionHeading title="Pricing and terms" />
              <div className={styles.termsGrid}>
                <div>
                  <h3>{tool.pricing}</h3>
                  <p>{tool.pricingDetail}</p>
                </div>
                <div>
                  <h3>Privacy and commercial use</h3>
                  <p>{tool.privacy}</p>
                  <p>{tool.commercialUse}</p>
                </div>
              </div>
              <a className={styles.inlineAction} href={tool.officialUrl} rel="noreferrer" target="_blank">
                Verify on official site <ExternalLink aria-hidden="true" />
              </a>
            </section>

            <SourcesDisclosure tool={tool} />
          </div>

          <aside className={styles.sidebar}>
            <SidebarCard title="Trust & verification">
              <dl className={styles.compactFacts}>
                {trustFacts.map(([label, value]) => <CompactFact key={label} label={label} value={value} />)}
              </dl>
              <p className={styles.caution}>Information can change. Verify pricing, privacy, and commercial-use terms on the official website before making a final decision.</p>
            </SidebarCard>

            <SidebarCard title="Quick facts">
              <dl className={styles.compactFacts}>
                {quickFacts.map(([label, value]) => <CompactFact href={label === "Website" ? tool.officialUrl : undefined} key={label} label={label} value={value} />)}
              </dl>
            </SidebarCard>

            {tool.similarTools.length > 0 ? (
              <SidebarCard title="Alternatives to consider">
                <div className={styles.alternativesList}>
                  {tool.similarTools.slice(0, 4).map((item) => <AlternativeRow key={item.slug} tool={item} />)}
                </div>
              </SidebarCard>
            ) : null}
          </aside>
        </div>

        {tool.similarTools.length > 0 ? (
          <section className={styles.similarSection} aria-labelledby="similar-tools-title">
            <div className={styles.similarHeader}>
              <h2 id="similar-tools-title">Similar tools</h2>
              <p>Explore nearby options from the same or related workflows.</p>
            </div>
            <div className={styles.similarGrid}>
              {tool.similarTools.slice(0, 4).map((item) => <SimilarToolCard key={item.slug} tool={item} />)}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Breadcrumb({ items }: { items: ToolDetailViewModel["breadcrumb"] }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          {index < items.length - 1 ? <span className={styles.separator} aria-hidden="true">/</span> : null}
        </span>
      ))}
    </nav>
  );
}

function StatusPill({ label, tone }: { label: string; tone: ToolDetailTone }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : tone === "warning" ? AlertTriangle : ShieldCheck;
  return <span className={cn(styles.statusPill, styles[tone])} title="Verified means PlutoFinds found supporting source checks for the official website and key record data."><Icon aria-hidden="true" />{label}</span>;
}

function Meta({ href, icon: Icon, label, value }: { href?: string; icon: typeof Layers3; label: string; value: string }) {
  return (
    <div>
      <dt><Icon aria-hidden="true" />{label}</dt>
      <dd>{href ? <a href={href} rel="noreferrer" target="_blank">{value}<ExternalLink aria-hidden="true" /></a> : value}</dd>
    </div>
  );
}

function TrustItem({ detail, icon: Icon, label, tone }: { detail: string; icon: typeof ShieldCheck; label: string; tone: ToolDetailTone }) {
  return (
    <div className={styles.trustItem}>
      <span className={cn(styles.trustIcon, styles[tone])}><Icon aria-hidden="true" /></span>
      <span><strong>{label}</strong><small>{detail}</small></span>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className={styles.sectionHeading}>{title}</h2>;
}

function DetailFact({ icon: Icon, label, value }: { icon: typeof CircleDollarSign; label: string; value: string }) {
  return (
    <div className={styles.detailFact}>
      <span><Icon aria-hidden="true" /></span>
      <div><dt>{label}</dt><dd>{value}</dd></div>
    </div>
  );
}

function Capability({ label }: { label: string }) {
  return <div className={styles.capability}><Boxes aria-hidden="true" /><span>{label}</span></div>;
}

function PointList({ items, title, tone }: { items: string[]; title: string; tone: "success" | "warning" }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  const fallback = tone === "success" ? ["Useful for the listed workflow"] : ["Confirm current availability and terms before committing"];
  return (
    <div className={cn(styles.pointPanel, styles[tone])}>
      <h3>{title}</h3>
      <ul>
        {(items.length > 0 ? items : fallback).slice(0, 4).map((item) => <li key={item}><Icon aria-hidden="true" />{item}</li>)}
      </ul>
    </div>
  );
}

function SourcesDisclosure({ tool }: { tool: ToolDetailViewModel }) {
  return (
    <details className={styles.sourcesCard}>
      <summary>
        <span><Sparkles aria-hidden="true" />Sources and verification</span>
        <small>{tool.sourceCountLabel} · checked {tool.lastChecked}</small>
      </summary>
      <div className={styles.sourceRows}>
        {tool.sources.map((source) => (
          <a href={source.href || tool.officialUrl} key={`${source.domain}-${source.title}`} rel="noreferrer" target="_blank">
            <span><FileCheck2 aria-hidden="true" />{source.title}</span>
            <small>{source.type} · {source.domain}{source.official ? " · Official" : ""}</small>
            <ExternalLink aria-hidden="true" />
          </a>
        ))}
      </div>
    </details>
  );
}

function SidebarCard({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className={styles.sidebarCard}><h2>{title}</h2>{children}</section>;
}

function CompactFact({ href, label, value }: { href?: string; label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{href ? <a href={href} rel="noreferrer" target="_blank">{value}<ExternalLink aria-hidden="true" /></a> : value}</dd></div>;
}

function AlternativeRow({ tool }: { tool: ToolDetailAlternative }) {
  return (
    <Link className={styles.alternativeRow} href={tool.href}>
      <ToolLogo className={styles.altLogo} name={tool.name} src={tool.logoUrl} />
      <span><strong>{tool.name}</strong><small>{tool.category}</small></span>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

function SimilarToolCard({ tool }: { tool: ToolDetailAlternative }) {
  return (
    <article className={styles.similarCard}>
      <ToolLogo className={styles.similarLogo} name={tool.name} src={tool.logoUrl} />
      <div className={styles.similarCopy}>
        <h3>{tool.name}</h3>
        <p>{tool.category}</p>
      </div>
      <div className={styles.similarActions}>
        <Link href={tool.href}>View details <ArrowRight aria-hidden="true" /></Link>
        <CompareButton compact toolName={tool.name} toolSlug={tool.slug} variant="outline" />
      </div>
    </article>
  );
}

function buildTake(tool: ToolDetailViewModel) {
  const audience = listText(tool.bestFor, 2).toLowerCase();
  const capability = tool.capabilities[0]?.toLowerCase() || tool.subcategory.toLowerCase() || tool.category.toLowerCase();
  const caveat = tool.limitations[0] || "important pricing, privacy, and availability details should be verified on the official website.";
  return `${tool.name} is worth considering for ${audience} who need ${capability}. PlutoFinds shows it as ${tool.verificationStatus.toLowerCase()}, with ${tool.sourceCountLabel.toLowerCase()}. ${caveat}`;
}

function listText(items: string[], limit: number) {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return "Not available";
  const visible = clean.slice(0, limit).join(", ");
  return clean.length > limit ? `${visible}, more` : visible;
}

export function faviconFor(url?: string) {
  return getFaviconLogoUrl(url);
}