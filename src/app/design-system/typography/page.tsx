import { PageHeader } from "@/components/layout/page-header";
import { PageShell, SectionShell } from "@/components/layout/page-shell";

const typeTokens = [
  {
    name: "Display XL",
    className: "type-display-xl",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "48px equivalent -> fluid -> 72px equivalent",
    leading: "1.05",
    tracking: "-0.025em",
    usage: "Primary brand-level hero statements and the most prominent marketing message.",
    avoid: "Do not use repeatedly in one viewport or for ordinary page titles.",
    sample: "Find the right AI tool for anything."
  },
  {
    name: "Display L",
    className: "type-display-lg",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "42px equivalent -> fluid -> 64px equivalent",
    leading: "1.08",
    tracking: "-0.024em",
    usage: "Secondary hero sections, high-impact CTAs and major editorial statements.",
    avoid: "Do not use inside dense dashboards, cards or filter panels.",
    sample: "Decide with context, not noise."
  },
  {
    name: "H1",
    className: "type-h1",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "36px equivalent -> fluid -> 48px equivalent",
    leading: "1.12",
    tracking: "-0.022em",
    usage: "Primary page title. Generally once per page.",
    avoid: "Do not use for card headings or repeated section titles.",
    sample: "Discover"
  },
  {
    name: "H2",
    className: "type-h2",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "30px equivalent -> fluid -> 40px equivalent",
    leading: "1.16",
    tracking: "-0.02em",
    usage: "Major page sections and prominent grouped content.",
    avoid: "Do not use for compact list rows or minor widgets.",
    sample: "Browse by Category"
  },
  {
    name: "H3",
    className: "type-h3",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "26px equivalent -> fluid -> 32px equivalent",
    leading: "1.22",
    tracking: "-0.016em",
    usage: "Subsections, detail-page panels and important content groups.",
    avoid: "Do not use as the default card title style.",
    sample: "Key Features"
  },
  {
    name: "H4",
    className: "type-h4",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "22px equivalent -> fluid -> 24px equivalent",
    leading: "1.3",
    tracking: "-0.012em",
    usage: "Card titles, modal headings, dashboard panels and compact sections.",
    avoid: "Do not use when many cards must be scanned quickly; use H5 instead.",
    sample: "Pricing Snapshot"
  },
  {
    name: "H5",
    className: "type-h5",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "20px equivalent",
    leading: "1.35",
    tracking: "-0.006em",
    usage: "AI tool names, compact cards, search result titles and sidebar module titles.",
    avoid: "Do not use for metadata or badges.",
    sample: "Gamma"
  },
  {
    name: "H6",
    className: "type-h6",
    family: "Bricolage Grotesque",
    weight: "700",
    size: "18px equivalent",
    leading: "1.42",
    tracking: "0em",
    usage: "Tertiary headings, nested sections and compact expressive labels.",
    avoid: "Do not use simply because text needs to be small.",
    sample: "Verification"
  },
  {
    name: "Body XL",
    className: "type-body-xl",
    family: "Inter",
    weight: "400",
    size: "18px equivalent -> fluid -> 20px equivalent",
    leading: "1.6",
    tracking: "0em",
    usage: "Hero descriptions, page introductions and high-emphasis supporting text.",
    avoid: "Do not use for dense cards, tables or repeated metadata.",
    sample: "Discover, compare and choose the best AI tools for your workflow."
  },
  {
    name: "Body L",
    className: "type-body-lg",
    family: "Inter",
    weight: "400",
    size: "17px equivalent -> fluid -> 18px equivalent",
    leading: "1.6",
    tracking: "0em",
    usage: "Section introductions, prominent descriptions and article lead-ins.",
    avoid: "Do not use as the default table or card description size.",
    sample: "A guided flow turns goals into ranked recommendations."
  },
  {
    name: "Body M",
    className: "type-body-md",
    family: "Inter",
    weight: "400",
    size: "16px equivalent",
    leading: "1.6",
    tracking: "0em",
    usage: "Default reading text, forms, paragraphs and general content.",
    avoid: "Do not shrink primary reading content below this without a reason.",
    sample: "Primary reading copy uses Body M."
  },
  {
    name: "Body S",
    className: "type-body-sm",
    family: "Inter",
    weight: "400",
    size: "14px equivalent",
    leading: "1.55",
    tracking: "0em",
    usage: "Card descriptions, helper text, dense interfaces and secondary information.",
    avoid: "Do not use as the default paragraph style for long reading sections.",
    sample: "Secondary context stays readable without overpowering the card."
  },
  {
    name: "Label L",
    className: "type-label-lg",
    family: "Inter",
    weight: "600",
    size: "16px equivalent",
    leading: "1.5",
    tracking: "-0.004em",
    usage: "Large buttons, important navigation and high-emphasis interactive UI.",
    avoid: "Do not use for paragraphs or descriptions.",
    sample: "Start Comparing"
  },
  {
    name: "Label M",
    className: "type-label-md",
    family: "Inter",
    weight: "600",
    size: "14px equivalent",
    leading: "1.43",
    tracking: "0em",
    usage: "Standard buttons, navigation, filters, tabs, form labels and menu items.",
    avoid: "Do not use as long-form body copy.",
    sample: "Sort tools"
  },
  {
    name: "Label S",
    className: "type-label-sm",
    family: "Inter",
    weight: "600",
    size: "12px equivalent",
    leading: "1.5",
    tracking: "0.017em",
    usage: "Badges, chips, compact filters and status indicators.",
    avoid: "Do not use for critical interaction labels that need emphasis.",
    sample: "Verified"
  },
  {
    name: "Caption",
    className: "type-caption",
    family: "Inter",
    weight: "400",
    size: "12px equivalent",
    leading: "1.5",
    tracking: "0.008em",
    usage: "Dates, source notes, supporting table information and secondary metadata.",
    avoid: "Do not use for primary information.",
    sample: "Last verified: August 2026"
  },
  {
    name: "Overline",
    className: "type-overline",
    family: "Inter",
    weight: "600",
    size: "11px equivalent -> fluid -> 12px equivalent",
    leading: "1.4",
    tracking: "0.06em",
    usage: "Short category or context labels above headings.",
    avoid: "Do not use for sentences or long descriptions.",
    sample: "FEATURED TOOL"
  }
];

export default function TypographyDocumentationPage() {
  return (
    <>
      <PageShell>
        <PageHeader
          eyebrow="Design System"
          title="Responsive Typography"
          description="Pluto uses Bricolage Grotesque for display and editorial hierarchy, and Inter for body copy and functional UI. Tokens live in CSS variables and semantic utilities so typography is chosen by role, not by ad hoc size."
        />
      </PageShell>

      <SectionShell spacing="none">
        <div className="grid gap-5">
          {typeTokens.map((token) => (
            <article className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-xs)]" key={token.name}>
              <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                <div>
                  <p className="type-overline text-[var(--text-tertiary)]">{token.className}</p>
                  <h2 className="mt-2 type-h2 text-[var(--text-primary)]">{token.name}</h2>
                  <dl className="mt-4 grid gap-2 type-body-sm text-[var(--text-secondary)] sm:grid-cols-2">
                    <div>
                      <dt className="type-label-sm text-[var(--text-tertiary)]">Font</dt>
                      <dd>{token.family}</dd>
                    </div>
                    <div>
                      <dt className="type-label-sm text-[var(--text-tertiary)]">Weight</dt>
                      <dd>{token.weight}</dd>
                    </div>
                    <div>
                      <dt className="type-label-sm text-[var(--text-tertiary)]">Size</dt>
                      <dd>{token.size}</dd>
                    </div>
                    <div>
                      <dt className="type-label-sm text-[var(--text-tertiary)]">Line height</dt>
                      <dd>{token.leading}</dd>
                    </div>
                    <div>
                      <dt className="type-label-sm text-[var(--text-tertiary)]">Tracking</dt>
                      <dd>{token.tracking}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <p className={`${token.className} text-[var(--text-primary)]`}>{token.sample}</p>
                  <div className="mt-5 grid gap-3 type-body-sm text-[var(--text-secondary)] md:grid-cols-2">
                    <p><span className="type-label-md text-[var(--text-primary)]">Use:</span> {token.usage}</p>
                    <p><span className="type-label-md text-[var(--text-primary)]">Do not use:</span> {token.avoid}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

