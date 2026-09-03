import Prism from 'prismjs';
import 'prismjs/components/prism-python.js';

export default function CodeView({ code, label }) {
  const html = Prism.highlight(code, Prism.languages.python, 'python');
  return (
    <figure className="code">
      {label && <figcaption>{label}</figcaption>}
      <pre><code className="language-python" dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </figure>
  );
}
