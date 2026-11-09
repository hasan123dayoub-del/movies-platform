// The public API's interactive docs (Swagger UI), served by the API itself
const API_DOCS_URL = "https://movies-platform-api.onrender.com/docs";
const REPO_URL = "https://github.com/hasan123dayoub-del/movies-platform";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-500">
        <p>Movies Platform · Built with Next.js, Express and PostgreSQL</p>
        <nav aria-label="Project links" className="flex gap-5">
          <a href={API_DOCS_URL} className="transition hover:text-white">
            API docs
          </a>
          <a href={REPO_URL} className="transition hover:text-white">
            Source code
          </a>
        </nav>
      </div>
    </footer>
  );
}
