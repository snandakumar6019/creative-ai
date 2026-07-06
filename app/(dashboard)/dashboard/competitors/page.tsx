"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  Filter,
  Globe2,
  ImageIcon,
  Megaphone,
  MousePointerClick,
  PlaySquare,
  Search,
  Sparkles,
  X
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialFacebookAdLibraryState,
  searchFacebookAdLibraryAction
} from "./actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FacebookAdLibraryCreative } from "@/lib/services/facebook-ad-library";

type ActiveStatus = "Active" | "Inactive";

type CompetitorCreative = {
  id: string;
  brandName: string;
  adType: string;
  mediaType: "Image" | "Video" | "Carousel";
  country: string;
  activeStatus: ActiveStatus;
  date: string;
  cta: string;
  headline: string;
  description: string;
  landingPage: string;
  impressions: string;
  engagement: string;
  spend: string;
  angle: string;
  palette: string;
};

const creatives: CompetitorCreative[] = [
  {
    id: "northstar-launch-video",
    brandName: "Northstar Labs",
    adType: "Launch Video",
    mediaType: "Video",
    country: "United States",
    activeStatus: "Active",
    date: "Jul 2, 2026",
    cta: "Book a demo",
    headline: "Turn campaign chaos into a weekly creative system.",
    description:
      "A polished founder-led video ad focused on creative throughput, approvals, and measurable lift.",
    landingPage: "northstarlabs.example/creative-system",
    impressions: "184K",
    engagement: "4.8%",
    spend: "$12.4K",
    angle: "Operational speed for growth teams",
    palette: "from-teal-500 via-cyan-500 to-slate-900"
  },
  {
    id: "orbit-carousel",
    brandName: "Orbit Studio",
    adType: "Feature Carousel",
    mediaType: "Carousel",
    country: "Canada",
    activeStatus: "Active",
    date: "Jun 28, 2026",
    cta: "Start free",
    headline: "Ship ten ad concepts before your next standup.",
    description:
      "Carousel creative showing prompt-to-variant workflows and before/after campaign outputs.",
    landingPage: "orbitstudio.example/templates",
    impressions: "96K",
    engagement: "5.6%",
    spend: "$8.1K",
    angle: "Fast concepting for lean creative teams",
    palette: "from-fuchsia-500 via-rose-500 to-zinc-950"
  },
  {
    id: "launchdesk-static",
    brandName: "LaunchDesk",
    adType: "Static Social",
    mediaType: "Image",
    country: "United Kingdom",
    activeStatus: "Inactive",
    date: "Jun 21, 2026",
    cta: "Compare plans",
    headline: "Creative testing without the production bottleneck.",
    description:
      "High-contrast static ad using pricing anchors and testimonial snippets for performance marketers.",
    landingPage: "launchdesk.example/pricing",
    impressions: "72K",
    engagement: "3.9%",
    spend: "$5.7K",
    angle: "Lower cost per tested idea",
    palette: "from-amber-400 via-orange-500 to-stone-950"
  },
  {
    id: "patternworks-demo",
    brandName: "PatternWorks",
    adType: "Product Demo",
    mediaType: "Video",
    country: "Australia",
    activeStatus: "Active",
    date: "Jun 18, 2026",
    cta: "Watch demo",
    headline: "See which creative patterns competitors repeat.",
    description:
      "Screen-recorded product demo that highlights competitor clustering and visual pattern extraction.",
    landingPage: "patternworks.example/demo",
    impressions: "121K",
    engagement: "6.2%",
    spend: "$10.2K",
    angle: "Competitive intelligence for creative strategy",
    palette: "from-emerald-500 via-lime-500 to-neutral-950"
  },
  {
    id: "brightframe-story",
    brandName: "Brightframe",
    adType: "Customer Story",
    mediaType: "Image",
    country: "Germany",
    activeStatus: "Active",
    date: "Jun 12, 2026",
    cta: "Read story",
    headline: "How one team cut review cycles from days to hours.",
    description:
      "Editorial-style customer proof ad pairing a team portrait with workflow metrics and quote cards.",
    landingPage: "brightframe.example/customers/alto",
    impressions: "58K",
    engagement: "4.1%",
    spend: "$4.8K",
    angle: "Proof-led workflow improvement",
    palette: "from-sky-500 via-indigo-500 to-neutral-950"
  },
  {
    id: "vectorly-retargeting",
    brandName: "Vectorly",
    adType: "Retargeting Ad",
    mediaType: "Carousel",
    country: "United States",
    activeStatus: "Inactive",
    date: "May 30, 2026",
    cta: "Get the guide",
    headline: "Five creative tests your competitors are already running.",
    description:
      "Lead-magnet carousel using competitor examples to re-engage site visitors and collect emails.",
    landingPage: "vectorly.example/guides/creative-tests",
    impressions: "143K",
    engagement: "3.4%",
    spend: "$9.6K",
    angle: "Education-first retargeting",
    palette: "from-red-500 via-pink-500 to-slate-950"
  }
];

const countries = ["All countries", ...Array.from(new Set(creatives.map((item) => item.country)))];
const mediaTypes = ["All media", ...Array.from(new Set(creatives.map((item) => item.mediaType)))];
const statuses = ["All statuses", "Active", "Inactive"];
const facebookCountries: Array<[string, string]> = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["BR", "Brazil"]
];

export default function CompetitorsPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All countries");
  const [mediaType, setMediaType] = useState("All media");
  const [activeStatus, setActiveStatus] = useState("All statuses");
  const [selectedCreative, setSelectedCreative] = useState<CompetitorCreative | null>(null);
  const [selectedFacebookCreative, setSelectedFacebookCreative] =
    useState<FacebookAdLibraryCreative | null>(null);
  const [facebookState, facebookAction] = useActionState(
    searchFacebookAdLibraryAction,
    initialFacebookAdLibraryState
  );
  const facebookCreatives = facebookState?.creatives ?? [];

  const filteredCreatives = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return creatives.filter((creative) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          creative.brandName,
          creative.adType,
          creative.cta,
          creative.headline,
          creative.description
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCountry = country === "All countries" || creative.country === country;
      const matchesMedia = mediaType === "All media" || creative.mediaType === mediaType;
      const matchesStatus =
        activeStatus === "All statuses" || creative.activeStatus === activeStatus;

      return matchesQuery && matchesCountry && matchesMedia && matchesStatus;
    });
  }, [activeStatus, country, mediaType, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitor Library"
        description="Search competitor creatives, filter market signals, and inspect ad details."
        action={
          <Button asChild>
            <Link href="/dashboard/creative-analysis">
              <Sparkles className="mr-2 size-4" />
              Creative analysis
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Tracked creatives" value={String(creatives.length)} detail="Across 5 markets" />
        <MetricCard label="Active ads" value={String(creatives.filter((item) => item.activeStatus === "Active").length)} detail="Live competitor signals" />
        <MetricCard label="Avg engagement" value="4.7%" detail="+0.8% vs last scan" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Facebook Ad Library search</CardTitle>
          <CardDescription>
            Search Meta ads by brand or app. Requires a Facebook Ad Library access token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={facebookAction} className="grid gap-4 lg:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="facebook-query">Brand or App</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="facebook-query"
                  name="facebookQuery"
                  placeholder="Nike, Canva, Shopify..."
                  className="pl-9"
                />
              </div>
            </div>

            <NativeSelect
              id="facebook-search-mode"
              name="facebookSearchMode"
              label="Search By"
              options={[
                ["brand", "Brand"],
                ["app", "App"]
              ]}
            />
            <NativeSelect
              id="facebook-country"
              name="facebookCountry"
              label="Country"
              options={facebookCountries}
            />
            <NativeSelect
              id="facebook-active"
              name="facebookActiveStatus"
              label="Active Ads"
              options={[
                ["ACTIVE", "Active"],
                ["ALL", "All"],
                ["INACTIVE", "Inactive"]
              ]}
            />
            <NativeSelect
              id="facebook-media"
              name="facebookMediaType"
              label="Creative"
              options={[
                ["ALL", "All"],
                ["IMAGE", "Images"],
                ["VIDEO", "Videos"]
              ]}
            />
            <FacebookSearchButton />
          </form>

          {facebookState.status === "error" && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {facebookState.error}
            </div>
          )}

          {facebookState.status === "success" && (
            <div className="mt-4 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
              Retrieved {facebookCreatives.length} Meta creatives for “{facebookState.query}”.
            </div>
          )}
        </CardContent>
      </Card>

      {facebookCreatives.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">Facebook Ad Library results</h2>
              <p className="text-sm text-muted-foreground">
                Image and video creative records normalized from Meta.
              </p>
            </div>
            <Badge variant="outline">{facebookCreatives.length} live results</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {facebookCreatives.map((creative) => (
              <FacebookCreativeCard
                key={creative.id}
                creative={creative}
                onOpen={() => setSelectedFacebookCreative(creative)}
              />
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mock competitor library</CardTitle>
          <CardDescription>Local placeholder data for design and offline development.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 pt-0 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="grid gap-2">
            <Label htmlFor="competitor-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="competitor-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search brand, ad type, CTA, headline..."
                className="pl-9"
              />
            </div>
          </div>

          <FilterSelect
            id="country-filter"
            label="Country"
            value={country}
            options={countries}
            onChange={setCountry}
          />
          <FilterSelect
            id="media-filter"
            label="Media Type"
            value={mediaType}
            options={mediaTypes}
            onChange={setMediaType}
          />
          <FilterSelect
            id="status-filter"
            label="Active Status"
            value={activeStatus}
            options={statuses}
            onChange={setActiveStatus}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          {filteredCreatives.length} {filteredCreatives.length === 1 ? "creative" : "creatives"} found
        </div>
        {(query || country !== "All countries" || mediaType !== "All media" || activeStatus !== "All statuses") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCountry("All countries");
              setMediaType("All media");
              setActiveStatus("All statuses");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {filteredCreatives.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCreatives.map((creative) => (
            <CreativeCard
              key={creative.id}
              creative={creative}
              onOpen={() => setSelectedCreative(creative)}
            />
          ))}
        </section>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted">
              <Search className="size-6 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No creatives match those filters</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Try a broader search, another country, or a different media type.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCreative && (
        <CreativeDetailModal
          creative={selectedCreative}
          onClose={() => setSelectedCreative(null)}
        />
      )}

      {selectedFacebookCreative && (
        <FacebookCreativeDetailModal
          creative={selectedFacebookCreative}
          onClose={() => setSelectedFacebookCreative(null)}
        />
      )}
    </div>
  );
}

function NativeSelect({
  id,
  name,
  label,
  options
}: {
  id: string;
  name: string;
  label: string;
  options: Array<[string, string]>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}

function FacebookSearchButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="self-end" disabled={pending}>
      <Search className="mr-2 size-4" />
      {pending ? "Searching..." : "Search"}
    </Button>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function CreativeCard({
  creative,
  onOpen
}: {
  creative: CompetitorCreative;
  onOpen: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CreativeThumbnail creative={creative} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{creative.brandName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{creative.adType}</p>
          </div>
          <StatusBadge status={creative.activeStatus} />
        </div>

        <div className="mt-5 grid gap-3 text-sm">
          <CardFact icon={ImageIcon} label="Media" value={creative.mediaType} />
          <CardFact icon={CalendarDays} label="Date" value={creative.date} />
          <CardFact icon={MousePointerClick} label="CTA" value={creative.cta} />
        </div>
      </CardContent>
    </Card>
  );
}

function CreativeThumbnail({ creative }: { creative: CompetitorCreative }) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-gradient-to-br", creative.palette)}>
      <Image
        src="/creative-ai-preview.png"
        alt=""
        fill
        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover opacity-18 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-foreground">
          {creative.mediaType}
        </span>
        {creative.mediaType === "Video" && (
          <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground">
            <PlaySquare className="size-4" />
          </span>
        )}
      </div>
      <div className="absolute inset-x-4 bottom-4">
        <p className="max-w-[18rem] text-lg font-semibold leading-tight text-white">
          {creative.headline}
        </p>
      </div>
    </div>
  );
}

function FacebookCreativeCard({
  creative,
  onOpen
}: {
  creative: FacebookAdLibraryCreative;
  onOpen: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-slate-950">
        {creative.thumbnailUrl ? (
          <Image
            src={creative.thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Image
            src="/creative-ai-preview.png"
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-18 mix-blend-screen"
          />
        )}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{creative.mediaType}</Badge>
          <Badge variant={creative.activeStatus === "Active" ? "default" : "outline"}>
            {creative.activeStatus}
          </Badge>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <p className="line-clamp-2 text-lg font-semibold leading-tight text-white">
            {creative.headline}
          </p>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{creative.brandName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{creative.adType}</p>
          </div>
          <Badge variant="outline">{creative.country}</Badge>
        </div>
        <div className="mt-5 grid gap-3 text-sm">
          <CardFact icon={ImageIcon} label="Media" value={creative.mediaType} />
          <CardFact icon={CalendarDays} label="Date" value={formatFacebookDate(creative.date)} />
          <CardFact icon={MousePointerClick} label="CTA" value={creative.cta} />
        </div>
      </CardContent>
    </Card>
  );
}

function CreativeDetailModal({
  creative,
  onClose
}: {
  creative: CompetitorCreative;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="creative-detail-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border bg-card shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{creative.mediaType}</Badge>
              <StatusBadge status={creative.activeStatus} />
            </div>
            <h2 id="creative-detail-title" className="text-2xl font-semibold tracking-normal">
              {creative.brandName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{creative.adType}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="size-4" />
          </Button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <CreativeThumbnail creative={creative} />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance snapshot</CardTitle>
                <CardDescription>Mock competitor intelligence metrics.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <ModalMetric label="Impressions" value={creative.impressions} />
                <ModalMetric label="Engagement" value={creative.engagement} />
                <ModalMetric label="Est. spend" value={creative.spend} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Creative details</CardTitle>
                <CardDescription>{creative.headline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow icon={Globe2} label="Country" value={creative.country} />
                <DetailRow icon={CalendarDays} label="Date" value={creative.date} />
                <DetailRow icon={MousePointerClick} label="CTA" value={creative.cta} />
                <DetailRow icon={Megaphone} label="Angle" value={creative.angle} />
                <DetailRow icon={ExternalLink} label="Landing page" value={creative.landingPage} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{creative.description}</p>
              </CardContent>
            </Card>

            <Button asChild className="w-full">
              <Link href="/dashboard/creative-analysis">
                <Sparkles className="mr-2 size-4" />
                Open creative analysis
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacebookCreativeDetailModal({
  creative,
  onClose
}: {
  creative: FacebookAdLibraryCreative;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="facebook-creative-detail-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border bg-card shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Meta Ad Library</Badge>
              <Badge variant="outline">{creative.mediaType}</Badge>
              <Badge variant={creative.activeStatus === "Active" ? "default" : "outline"}>
                {creative.activeStatus}
              </Badge>
            </div>
            <h2 id="facebook-creative-detail-title" className="text-2xl font-semibold tracking-normal">
              {creative.brandName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{creative.adType}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="size-4" />
          </Button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-gradient-to-br from-teal-500 via-cyan-500 to-slate-950">
              {creative.thumbnailUrl ? (
                <Image src={creative.thumbnailUrl} alt="" fill className="object-cover" />
              ) : (
                <Image
                  src="/creative-ai-preview.png"
                  alt=""
                  fill
                  className="object-cover opacity-18 mix-blend-screen"
                />
              )}
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-x-4 bottom-4">
                <p className="text-lg font-semibold text-white">{creative.headline}</p>
              </div>
            </div>
            {creative.snapshotUrl && (
              <Button asChild variant="outline" className="w-full">
                <Link href={creative.snapshotUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  Open Meta snapshot
                </Link>
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Creative details</CardTitle>
                <CardDescription>{creative.headline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow icon={Globe2} label="Country" value={creative.country} />
                <DetailRow icon={CalendarDays} label="Date" value={formatFacebookDate(creative.date)} />
                <DetailRow icon={MousePointerClick} label="CTA" value={creative.cta} />
                <DetailRow icon={ImageIcon} label="Media Type" value={creative.mediaType} />
                <DetailRow
                  icon={Megaphone}
                  label="Platforms"
                  value={creative.platforms.length > 0 ? creative.platforms.join(", ") : "Not returned"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ad copy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{creative.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Eye className="size-4 text-primary" />
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-normal">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ModalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/25 p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function CardFact({
  icon: Icon,
  label,
  value
}: {
  icon: typeof ImageIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ActiveStatus }) {
  return (
    <Badge variant={status === "Active" ? "default" : "outline"} className="shrink-0">
      {status === "Active" && <CheckCircle2 className="mr-1 size-3" />}
      {status}
    </Badge>
  );
}

function formatFacebookDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
