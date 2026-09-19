import type { CSSProperties } from "react";
import styles from "./pluto-hero.module.css";

const PARTICLE_COUNT = 36;

type ParticleStyle = CSSProperties & {
  "--particle-delay": string;
  "--particle-duration": string;
  "--particle-drift": string;
  "--particle-opacity": string;
  "--particle-size": string;
  "--particle-x": string;
  "--particle-y": string;
};

function particleValue(index: number, multiplier: number, modulus: number) {
  return (index * multiplier + 17) % modulus;
}

export function CatParticles() {
  return (
    <div aria-hidden="true" className={styles.catParticles}>
      {Array.from({ length: PARTICLE_COUNT }, (_, index) => {
        const style: ParticleStyle = {
          "--particle-delay": `${-(particleValue(index, 37, 120) / 10)}s`,
          "--particle-duration": `${7 + particleValue(index, 29, 70) / 10}s`,
          "--particle-drift": `${particleValue(index, 23, 25) - 12}px`,
          "--particle-opacity": `${0.2 + particleValue(index, 13, 36) / 100}`,
          "--particle-size": `${1 + particleValue(index, 11, 45) / 10}px`,
          "--particle-x": `${12 + particleValue(index, 31, 76)}%`,
          "--particle-y": `${6 + particleValue(index, 19, 88)}%`
        };

        return <span className={styles.catParticle} key={index} style={style} />;
      })}
    </div>
  );
}
