export default function AppLoading() {
  return (
    <main aria-busy="true" aria-label="Loading page" className="app-route-loading">
      <div className="app-route-loading-shell">
        <span className="app-route-loading-line app-route-loading-kicker" />
        <span className="app-route-loading-line app-route-loading-title" />
        <span className="app-route-loading-line app-route-loading-copy" />
        <div className="app-route-loading-grid">
          {Array.from({ length: 3 }, (_, index) => <span className="app-route-loading-card" key={index} />)}
        </div>
      </div>
    </main>
  );
}
