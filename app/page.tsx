import Link from "next/link";
import LiveDemo from "@/components/landing/LiveDemo";
import SlotPreview, { type SlotCode } from "@/components/landing/SlotPreview";
import { CapturiaLogo } from "@/components/landing/Brand";

/* ─────────────────────────────────────────────────────────────
   Capturia landing. Página de lanzamiento de producto. ADN de
   broadcast mantenido como toque de calidad (rojo tally, verde
   fosforescente, la sensación de estar en vivo). Cada palabra
   escrita para emprendedores y presentadores. Server component.
   ───────────────────────────────────────────────────────────── */

const GITHUB = "https://github.com/AndresCarreonDiaz/capturia";
const LICENSE = "https://github.com/AndresCarreonDiaz/capturia/blob/main/LICENSE";

export default function Landing() {
  return (
    <main className="min-h-screen bg-[var(--studio-black)] text-[var(--studio-ink)] selection:bg-[var(--phosphor)]/30 selection:text-white">
      <TopNav />
      <Hero />
      <HumanCaption />
      <HowItWorks />
      <OnScreen />
      <UseCases />
      <Pricing />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

/* ───── 1. Navegación fija ───── */

function TopNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--studio-black)]/80 border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Inicio Capturia"
          className="flex items-center gap-3 text-[var(--studio-ink)] hover:opacity-90 transition-opacity"
        >
          <CapturiaLogo style={{ height: 24, width: "auto" }} />
          <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--studio-fade)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--tally)] tally-pulse" />
            <span className="text-[var(--tally)]">En&nbsp;Vivo</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[13px] text-[var(--studio-graphite)]">
          <a href="#how" className="hover:text-white transition-colors">Cómo funciona</a>
          <a href="#use-cases" className="hover:text-white transition-colors">Casos de uso</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline px-2 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--studio-fade)] hover:text-white transition-colors"
          >
            Código
          </a>
          <Link
            href="/studio"
            className="cta-solid inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium"
          >
            Probar gratis
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───── 2. Hero ───── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 studio-grid-bg opacity-[0.15] pointer-events-none" />
      <div aria-hidden className="grain-overlay" style={{ opacity: 0.025 }} />
      <div
        aria-hidden
        className="phosphor-wash"
        style={{ top: "-12%", left: "50%", transform: "translateX(-50%)", width: "60%", height: "60%" }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 relative text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full studio-pill px-3.5 py-1.5 reveal-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--phosphor)]" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--studio-graphite)]">
            Gráficos en vivo, solo hablando
          </span>
        </div>

        {/* Headline */}
        <h1 className="display-serif mx-auto mt-7 max-w-4xl text-[clamp(2.75rem,8vw,6.25rem)] text-[var(--studio-ink)] reveal-up [animation-delay:80ms]">
          Gráficos profesionales en tu cámara.{" "}
          <span className="italic text-[var(--phosphor)] [text-shadow:0_0_36px_rgba(82,255,139,0.22)]">
            Solo hablando.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mx-auto mt-6 max-w-2xl text-[var(--studio-graphite)] text-base sm:text-lg leading-relaxed reveal-up [animation-delay:160ms]">
          Capturia es una IA que pone tus números, tu nombre y tus titulares
          en pantalla en el instante que los dices. Perfecto para pitches, charlas y demos
          en Zoom, Teams y Meet.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 reveal-up [animation-delay:240ms]">
          <Link
            href="/studio"
            className="cta-solid inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[15px] font-semibold w-full sm:w-auto justify-center"
          >
            Probar gratis
            <span aria-hidden>→</span>
          </Link>
          <a
            href="#demo"
            className="ghost-btn inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[15px] font-medium w-full sm:w-auto justify-center"
          >
            Ver cómo funciona
          </a>
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--studio-fade)] reveal-up [animation-delay:300ms]">
          Gratis · sin registro · Chrome / Edge para voz
        </p>

        {/* The live demo: the proof */}
        <div id="demo" className="mt-12 sm:mt-16 reveal-up [animation-delay:360ms] text-left">
          <LiveDemo />
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--studio-fade)] reveal-up [animation-delay:420ms]">
          <span className="text-[var(--phosphor)]">1er lugar en el Hackathon de UI Generativa</span>
          <span aria-hidden className="trust-pip" />
          <span>Funciona en Zoom, Teams, Meet</span>
          <span aria-hidden className="trust-pip" />
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Código abierto
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───── 3. Caption humano conectando el demo con la realidad ───── */

function HumanCaption() {
  return (
    <section className="border-y border-white/[0.06] bg-[var(--studio-mist)]">
      <div className="mx-auto max-w-4xl px-6 py-14 sm:py-20 text-center">
        <p className="display-serif text-[var(--studio-ink)] text-[clamp(1.7rem,4vw,3rem)] leading-[1.18]">
          Todo lo anterior es{" "}
          <span className="italic text-[var(--phosphor)]">en vivo</span>. Sin edición,
          sin cortes. Solo hablas.
        </p>
      </div>
    </section>
  );
}

/* ───── 4. Cómo funciona ───── */

function HowItWorks() {
  const steps: Array<{ n: string; title: string; body: string }> = [
    {
      n: "1",
      title: "Enciende tu cámara",
      body: "Abre Capturia en tu navegador y activa tu webcam. Estás al aire en segundos.",
    },
    {
      n: "2",
      title: "Habla como normalmente lo harías",
      body: "Di tus números, tu nombre, tu punto. Sin comandos que memorizar, sin botones que buscar.",
    },
    {
      n: "3",
      title: "Los gráficos aparecen al instante",
      body: "Tercios inferiores, contadores, gráficas y tickers aparecen en tu video en el momento que los mencionas.",
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
      <SectionHead
        eyebrow="Cómo funciona"
        title={
          <>
            Tres pasos. <span className="italic text-[var(--phosphor)]">Cero curva de aprendizaje.</span>
          </>
        }
        kicker="Si puedes mantener una conversación, puedes usar Capturia."
      />

      <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="product-card rounded-2xl p-7 sm:p-8 reveal-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="step-numeral text-6xl sm:text-7xl">{s.n}</div>
            <h3 className="mt-5 text-[var(--studio-ink)] text-lg font-semibold tracking-tight">
              {s.title}
            </h3>
            <p className="mt-2.5 text-[var(--studio-graphite)] text-[14.5px] leading-relaxed">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      {/* Hook del deck */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[var(--studio-mist)]/50 px-6 py-5 reveal-up [animation-delay:320ms]">
        <span aria-hidden className="mt-0.5 text-[var(--signal)] text-lg leading-none">+</span>
        <p className="text-[var(--studio-graphite)] text-[14.5px] leading-relaxed">
          <span className="text-[var(--studio-ink)] font-medium">Trae tu presentación.</span>{" "}
          Súbela una vez y tus números estarán listos para mostrarse en el momento que los menciones.
        </p>
      </div>
    </section>
  );
}

/* ───── 5. Lo que puede poner en pantalla (miniaturas SlotPreview en vivo) ───── */

interface Slot {
  code: SlotCode;
  name: string;
}

const GROUPS: Array<{ heading: string; blurb: string; slots: Slot[] }> = [
  {
    heading: "Tus números",
    blurb: "Tracción, crecimiento y logros, animados en el instante que los dices.",
    slots: [
      { code: "MTR", name: "Métricas" },
      { code: "BCT", name: "Número grande" },
      { code: "RNG", name: "Anillo" },
      { code: "PRG", name: "Progreso" },
      { code: "CHT", name: "Gráfica" },
    ],
  },
  {
    heading: "Tu historia",
    blurb: "Barras de nombre, puntos clave y un ticker en vivo que mantienen tu mensaje claro.",
    slots: [
      { code: "LTH", name: "Barra nombre" },
      { code: "KWD", name: "Puntos clave" },
      { code: "TLN", name: "Línea tiempo" },
      { code: "TKR", name: "Ticker" },
      { code: "BUB", name: "Cita" },
    ],
  },
  {
    heading: "Cinemático",
    blurb: "Toques de broadcast que hacen que cualquier llamada parezca una producción.",
    slots: [
      { code: "BDG", name: "Badge en vivo" },
      { code: "LBX", name: "Letterbox" },
    ],
  },
];

function OnScreen() {
  return (
    <section className="border-y border-white/[0.06] bg-[var(--studio-mist)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <SectionHead
          eyebrow="Lo que puede mostrar"
          title={
            <>
              Toda una sala de control, <span className="italic text-[var(--signal)]">con tu voz</span>.
            </>
          }
          kicker="Estos están en vivo, los mismos gráficos que viste corriendo en el demo de arriba."
        />

        <div className="mt-12 sm:mt-16 space-y-12 sm:space-y-16">
          {GROUPS.map((group, gi) => (
            <div key={group.heading}>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5">
                <h3 className="display-serif text-[var(--studio-ink)] text-2xl sm:text-3xl">
                  {group.heading}
                </h3>
                <p className="text-[var(--studio-graphite)] text-[13.5px] sm:max-w-md sm:text-right leading-relaxed">
                  {group.blurb}
                </p>
              </div>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {group.slots.map((s, i) => (
                  <div
                    key={s.code}
                    className="product-card rounded-xl overflow-hidden reveal-up"
                    style={{ animationDelay: `${(gi * 3 + i) * 50}ms` }}
                  >
                    <div className="rounded-t-xl overflow-hidden">
                      <SlotPreview code={s.code} />
                    </div>
                    <div className="px-3.5 py-3 text-[var(--studio-ink)] text-[13px] font-medium">
                      {s.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── 6. Casos de uso ───── */

function UseCases() {
  const cases: Array<{ tag: string; title: string; body: string; accent: string }> = [
    {
      tag: "Emprendedores",
      title: "Presenta con pruebas",
      body: "Di tus ingresos y crecimiento y mira cómo aparecen en pantalla. Los inversionistas ven tracción, no solo slides.",
      accent: "var(--phosphor)",
    },
    {
      tag: "Speakers",
      title: "Domina la charla",
      body: "Tu nombre, tu título y tus puntos clave aparecen como tercios inferiores mientras hablas.",
      accent: "var(--amber-cue)",
    },
    {
      tag: "Creadores de cursos",
      title: "Haz que las lecciones queden",
      body: "Resalta términos, muestra progreso y marca capítulos en vivo, para que tus estudiantes siempre sepan dónde están.",
      accent: "var(--magenta-sweep)",
    },
    {
      tag: "Consultores",
      title: "Presenta como una televisora",
      body: "Pon KPIs en vivo y un ticker de marca en tu llamada. Cada reunión con clientes se siente como un broadcast.",
      accent: "var(--signal)",
    },
  ];

  return (
    <section id="use-cases" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
      <SectionHead
        eyebrow="Casos de uso"
        title={
          <>
            Hecho para la gente <span className="italic text-[var(--phosphor)]">frente a cámara</span>.
          </>
        }
        kicker="Sin equipo, sin operador de gráficos, sin post-producción. Solo tú y tu voz."
      />

      <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {cases.map((c, i) => (
          <div
            key={c.tag}
            className="product-card rounded-2xl p-7 sm:p-8 reveal-up"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: c.accent, boxShadow: `0 0 12px ${c.accent}` }}
              />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--studio-fade)]">
                {c.tag}
              </span>
            </div>
            <h3 className="display-serif mt-4 text-[var(--studio-ink)] text-2xl sm:text-3xl">
              {c.title}
            </h3>
            <p className="mt-3 text-[var(--studio-graphite)] text-[15px] leading-relaxed">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───── 7. Precios ───── */

function Pricing() {
  return (
    <section id="pricing" className="border-y border-white/[0.06] bg-[var(--studio-mist)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
        <SectionHead
          eyebrow="Precios"
          title={
            <>
              Empieza gratis hoy. <span className="italic text-[var(--phosphor)]">Pasa a Pro pronto.</span>
            </>
          }
          kicker="El estudio en navegador es gratis y de código abierto. La cámara de escritorio viene en camino."
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Gratis */}
          <div className="product-card rounded-2xl p-8 reveal-up flex flex-col">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[var(--studio-ink)] text-xl font-semibold tracking-tight">Gratis</h3>
              <span className="display-serif text-[var(--studio-ink)] text-4xl">$0</span>
            </div>
            <p className="mt-2 text-[var(--studio-graphite)] text-[14px]">
              Úsalo en tu navegador, ahora mismo.
            </p>
            <ul className="mt-7 space-y-3.5 text-[14.5px] text-[var(--studio-graphite)] flex-1">
              <Feature>Ejecuta el estudio completo en tu navegador</Feature>
              <Feature>Todos los gráficos, controlados por tu voz</Feature>
              <Feature>Trae tu propia llave de IA (BYOK)</Feature>
              <Feature>Voz en Chrome y Edge</Feature>
            </ul>
            <Link
              href="/studio"
              className="cta-solid mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold"
            >
              Probar gratis
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Pro (próximamente) */}
          <div className="pro-card rounded-2xl p-8 reveal-up [animation-delay:120ms] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-[var(--studio-ink)] text-xl font-semibold tracking-tight">Pro</h3>
              <span className="rounded-full border border-[var(--phosphor)]/40 px-2.5 py-1 font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--phosphor)]">
                Próximamente
              </span>
            </div>
            <p className="mt-2 text-[var(--studio-graphite)] text-[14px]">
              Capturia como cámara de escritorio.
            </p>
            <ul className="mt-7 space-y-3.5 text-[14.5px] text-[var(--studio-graphite)] flex-1">
              <Feature accent="var(--phosphor)">Aparece como cámara en Zoom, Teams y Meet</Feature>
              <Feature accent="var(--phosphor)">Sube tu deck, números listos al momento</Feature>
              <Feature accent="var(--phosphor)">Sin límites de navegador, funciona en todas partes</Feature>
              <Feature accent="var(--phosphor)">Voz integrada, sin extensión necesaria</Feature>
            </ul>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="ghost-btn mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium"
            >
              Avísame en GitHub
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <li className="flex items-start gap-3">
      <svg
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className="mt-0.5 shrink-0"
        style={{ color: accent ?? "var(--studio-fade)" }}
      >
        <path
          d="M3 8.5l3 3 7-7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}

/* ───── 8. CTA Final ───── */

function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="phosphor-wash"
        style={{ bottom: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "70%" }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 sm:py-32 text-center relative">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--studio-fade)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tally)] tally-pulse" />
          <span className="text-[var(--tally)]">En Vivo</span>
          <span>· listo cuando tú lo estés</span>
        </div>
        <h2 className="display-serif mt-6 text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.02]">
          Pruébalo gratis.{" "}
          <span className="italic text-[var(--phosphor)] [text-shadow:0_0_36px_rgba(82,255,139,0.22)]">
            Solo empieza a hablar.
          </span>
        </h2>
        <p className="mt-6 text-[var(--studio-graphite)] max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
          La forma más rápida de sentir lo que hace Capturia es hablarle por treinta segundos.
          Abre el estudio y mira cómo tus palabras se convierten en gráficos.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/studio"
            className="cta-solid inline-flex items-center gap-2.5 rounded-full px-9 py-4 text-base font-semibold"
          >
            Probar gratis
            <span aria-hidden>→</span>
          </Link>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--studio-fade)]">
            Gratis · sin registro · Chrome / Edge para voz
          </span>
        </div>
      </div>
    </section>
  );
}

/* ───── 9. Pie de página ───── */

function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[var(--studio-mist)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-start">
        <div className="max-w-md">
          <Link
            href="/"
            aria-label="Inicio Capturia"
            className="inline-flex text-[var(--studio-ink)] hover:opacity-90 transition-opacity"
          >
            <CapturiaLogo style={{ height: 34, width: "auto" }} />
          </Link>
          <p className="mt-4 text-[var(--studio-graphite)] text-[14px] leading-relaxed">
            Gráficos de calidad broadcast en tu cámara, compuestos en vivo desde tu voz.
          </p>
          <p className="mt-3 text-[var(--studio-fade)] text-[12.5px] leading-relaxed">
            Construido por Andres Carreon, fundador de Bubblio. 1er lugar en el
            Hackathon Global de UI Generativa, Mayo 2026.
          </p>
          <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--studio-fade)]">
            Código abierto · construido con estándares abiertos ·{" "}
            <a
              href={LICENSE}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              MIT
            </a>
          </p>
        </div>

        <nav className="flex flex-col sm:items-end gap-2.5 text-[13px] text-[var(--studio-graphite)]">
          <Link href="/studio" className="hover:text-white transition-colors">
            Abrir el estudio
          </Link>
          <a href="#how" className="hover:text-white transition-colors">Cómo funciona</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            GitHub
          </a>
        </nav>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-10 flex items-center justify-between font-mono text-[9px] tracking-[0.24em] uppercase text-[var(--studio-fade)]">
          <span>Capturia · {new Date().getFullYear()}</span>
          <span>Stream&nbsp;inactivo · 00:00:00</span>
        </div>
      </div>
    </footer>
  );
}

/* ───── shared: section heading block ───── */

function SectionHead({
  eyebrow,
  title,
  kicker,
}: {
  eyebrow: string;
  title: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--phosphor)]">
          {eyebrow}
        </span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
      <h2 className="display-serif mt-4 text-[clamp(2rem,5vw,3.75rem)] leading-[1.04] text-[var(--studio-ink)]">
        {title}
      </h2>
      {kicker && (
        <p className="mt-4 text-[var(--studio-graphite)] text-[15px] sm:text-[16px] max-w-2xl leading-relaxed">
          {kicker}
        </p>
      )}
    </div>
  );
}
