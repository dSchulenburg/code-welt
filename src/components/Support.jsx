// Zeigt einen Stuetz-Text unter dem deutschen Text. Nur sichtbar, wenn eine
// Stuetzsprache aktiv ist UND die Person die Hilfe eingeblendet hat.
export default function Support({ show, children }) {
  if (!show || !children) return null;
  return <div className="support" data-testid="support">{children}</div>;
}
