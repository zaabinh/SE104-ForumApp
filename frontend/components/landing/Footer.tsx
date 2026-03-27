export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 py-8 text-sm text-slate-600">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">GitHub</a>
        </div>
        <p>© {new Date().getFullYear()} Forum.dev. All rights reserved.</p>
      </div>
    </footer>
  );
}
