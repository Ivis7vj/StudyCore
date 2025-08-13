export interface PhetSimulation {
  title: string;
  url: string;
  keywords: string[];
}

export const PHET_SIMULATIONS: PhetSimulation[] = [
  {
    title: "Faraday's Law",
    url: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html",
    keywords: ["electromagnetic", "induction", "magnet", "flux", "faraday"]
  },
  {
    title: "Circuit Construction Kit: DC",
    url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html",
    keywords: ["circuit", "voltage", "current", "resistance", "ohm", "electricity"]
  },
  {
    title: "Ohm's Law",
    url: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html",
    keywords: ["ohm", "resistance", "voltage", "current", "electricity"]
  },
  {
    title: "Wave on a String",
    url: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html",
    keywords: ["wave", "frequency", "amplitude", "oscillation", "string"]
  },
  {
    title: "Projectile Motion",
    url: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html",
    keywords: ["projectile", "motion", "gravity", "trajectory", "physics"]
  },
  {
    title: "Energy Skate Park",
    url: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html",
    keywords: ["energy", "kinetic", "potential", "conservation", "skate"]
  },
  {
    title: "Forces and Motion: Basics",
    url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html",
    keywords: ["force", "motion", "newton", "friction", "push", "pull"]
  },
  {
    title: "Gravity Force Lab",
    url: "https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_all.html",
    keywords: ["gravity", "force", "mass", "universal", "gravitational"]
  },
  {
    title: "Balancing Chemical Equations",
    url: "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html",
    keywords: ["chemical", "equation", "balance", "reaction", "chemistry"]
  },
  {
    title: "pH Scale",
    url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html",
    keywords: ["ph", "acid", "base", "concentration", "chemistry"]
  },
  {
    title: "Coulomb's Law",
    url: "https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law_all.html",
    keywords: ["coulomb", "electric", "charge", "force", "field"]
  },
  {
    title: "Build an Atom",
    url: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_all.html",
    keywords: ["atom", "proton", "neutron", "electron", "atomic"]
  },
  {
    title: "Molecule Shapes",
    url: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html",
    keywords: ["molecule", "shape", "geometry", "vsepr", "chemistry"]
  },
  {
    title: "States of Matter",
    url: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_all.html",
    keywords: ["states", "matter", "solid", "liquid", "gas", "phase"]
  },
  {
    title: "Density",
    url: "https://phet.colorado.edu/sims/html/density/latest/density_all.html",
    keywords: ["density", "mass", "volume", "buoyancy"]
  }
];

export function findSimulationByTopic(topic: string): PhetSimulation {
  const topicLower = topic.toLowerCase();
  const simulation = PHET_SIMULATIONS.find(sim => 
    sim.keywords.some(keyword => topicLower.includes(keyword))
  );
  
  return simulation || PHET_SIMULATIONS[0]; // Default fallback
}
