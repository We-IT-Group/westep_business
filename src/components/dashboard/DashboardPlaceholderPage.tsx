import PageMeta from "../common/PageMeta";

type PlaceholderCard = {
  title: string;
  value: string;
  detail: string;
};

type DashboardPlaceholderPageProps = {
  title: string;
  description: string;
  cards: PlaceholderCard[];
};

export default function DashboardPlaceholderPage({
  title,
  description,
  cards,
}: DashboardPlaceholderPageProps) {
  return (
    <>
      <PageMeta title={title} description={description} />
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_65%,#020617_100%)] px-6 py-7 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.75)] sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/70">
            Educational Platform
          </p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                {description}
              </p>
            </div>
            <div className="grid w-full max-w-md grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                  Active now
                </p>
                <p className="mt-2 text-2xl font-semibold">1,284</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                  Completion
                </p>
                <p className="mt-2 text-2xl font-semibold">87.4%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_16px_50px_-38px_rgba(15,23,42,0.55)]"
            >
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {card.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_16px_50px_-38px_rgba(15,23,42,0.55)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Layout ready
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  This page is prepared for the next Figma pass
                </h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                Placeholder
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Sidebar, header, spacing system, cards, and route structure are now
              aligned into a cleaner educational dashboard shell. The next step is
              replacing these placeholders with the exact widgets from your Figma.
            </p>
          </article>

          <article className="rounded-[28px] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[0_16px_50px_-38px_rgba(15,23,42,0.7)]">
            <p className="text-sm uppercase tracking-[0.28em] text-white/55">
              Status
            </p>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              <li>Dashboard shell installed</li>
              <li>Header and sidebar refreshed</li>
              <li>Figma-style routes connected</li>
              <li>Ready for section-by-section polishing</li>
            </ul>
          </article>
        </section>
      </div>
    </>
  );
}
