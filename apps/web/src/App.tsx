export function App() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1>KIVO</h1>
        <p>Team Operating System</p>
      </header>
      <section aria-labelledby="status-heading">
        <h2 id="status-heading">Application Foundation</h2>
        <p data-testid="app-status">Status: Initialized</p>
      </section>
    </main>
  );
}

export default App;
