import { BrowserRouter } from "react-router-dom";

import {
  About,
  Contact,
  Experience,
  Hero,
  Navbar,
  Skills,
  Projects,
  StarsCanvas,
  HireMe,
  Education,
} from "./components";

const App = () => {
  return (
    <BrowserRouter>
      <div className="relative z-0 bg-primary">
        <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
          <Navbar />
          <Hero />
        </div>
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Education />
        <div className="relative z-0">
          <Contact />
          <StarsCanvas />
        </div>
        <HireMe />
      </div>
    </BrowserRouter>
  );
};

export default App;
