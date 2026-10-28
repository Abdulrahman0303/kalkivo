import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import GstPage from './pages/GstPage.jsx';
import ScientificPage from './pages/ScientificPage.jsx';
import CalculatorPage from './pages/CalculatorPage.jsx';
import { getDefinition } from './data/calculatorDefs.js';
import useTheme from './hooks/useTheme.js';
import useHashRoute from './hooks/useHashRoute.js';

const BASE_TITLE = 'Kalkivo | Free Online Calculators';
// Hand-built pages. Config-driven calculators live at "#/c/<id>" (see data/calculatorDefs.js).
const ROUTES = {
  '/gst-calculator': { Page: GstPage, title: 'GST Calculator | Kalkivo' },
  '/scientific-calculator': { Page: ScientificPage, title: 'Scientific Calculator | Kalkivo' },
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const path = useHashRoute();
  const def = path.startsWith('/c/') ? getDefinition(path.slice(3)) : null;
  const route = ROUTES[path];
  const Page = route ? route.Page : HomePage;
  const title = def ? `${def.name} | Kalkivo` : route ? route.title : BASE_TITLE;
  const onHome = !def && !route;

  useEffect(() => {
    document.title = title;
    // Keep in-page anchors (#calculator, #categories...) working after leaving a calculator page.
    const id = window.location.hash.slice(1);
    if (onHome && id && !id.startsWith('/')) document.getElementById(id)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>{def ? <CalculatorPage key={def.id} def={def} /> : <Page />}</main>
      <Footer />
    </>
  );
}
