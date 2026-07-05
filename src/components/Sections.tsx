import { ARTIFACTS, PLACES, type PlaceData } from '../data/content';

interface SectionsProps {
  opened: boolean;
  onOpen: () => void;
  onSelectPlace: (place: PlaceData) => void;
}

export function Sections({ opened, onOpen, onSelectPlace }: SectionsProps) {
  return (
    <main className="scroll-layer">
      <section id="intro" className="scroll-step intro-step" aria-labelledby="intro-title">
        <div className="intro-copy">
          <p className="eyebrow">Software engineer · boardgame.io maintainer</p>
          <h1 id="intro-title">Rupesh Pandey</h1>
          <p>Scroll moves through the studio inside the Pokeball. Click an object when you want more detail.</p>
          {!opened && (
            <button className="action" type="button" onClick={onOpen}>
              Open the Pokeball
            </button>
          )}
        </div>
      </section>

      {ARTIFACTS.map((artifact) => (
        <section key={artifact.id} id={artifact.id} className="scroll-step section-step" aria-labelledby={`${artifact.id}-title`}>
          <div className="section-copy">
            <p className="eyebrow">{artifact.kicker}</p>
            <h2 id={`${artifact.id}-title`}>{artifact.title}</h2>
            <p>{artifact.body}</p>
            <p className="tag-row">{artifact.tags.join(' · ')}</p>
            {artifact.link && (
              <a className="text-link" href={artifact.link.href} target="_blank" rel="noreferrer">
                {artifact.link.label}
              </a>
            )}
            {artifact.id === 'places' && (
              <div className="place-actions" aria-label="Map pins">
                {PLACES.map((place) => (
                  <button key={place.id} type="button" onClick={() => onSelectPlace(place)}>
                    {place.title}
                  </button>
                ))}
              </div>
            )}
            {artifact.id === 'contact' && (
              <div className="contact-actions" aria-label="Contact links">
                <a href="mailto:pandeyrupesh00@gmail.com">Email</a>
                <a href="https://github.com/Rupesh-ark" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/ssh-rupesh/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
