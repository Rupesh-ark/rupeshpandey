import { ARTIFACTS, type ArtifactId } from '../data/content';

interface NavProps {
  opened: boolean;
  activeArtifact: ArtifactId;
  onOpen: () => void;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Nav({ opened, activeArtifact, onOpen }: NavProps) {
  return (
    <nav className="nav" aria-label="Studio sections">
      {!opened && (
        <button type="button" className="nav-open" onClick={onOpen}>
          Open
        </button>
      )}
      {ARTIFACTS.map((artifact) => (
        <button
          key={artifact.id}
          type="button"
          aria-current={opened && activeArtifact === artifact.id ? 'page' : undefined}
          onClick={() => scrollTo(artifact.id)}
        >
          {artifact.label}
        </button>
      ))}
    </nav>
  );
}
