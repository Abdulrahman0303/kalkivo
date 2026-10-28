import { useEffect, useState } from 'react';

// Tiny hash router: "#/gst-calculator" -> "/gst-calculator".
// Plain anchors such as "#calculator" or "#categories" keep working and map to "/".
const read = () => {
  const h = window.location.hash;
  return h.startsWith('#/') ? h.slice(1) : '/';
};

export default function useHashRoute() {
  const [path, setPath] = useState(read);
  useEffect(() => {
    const onChange = () => setPath(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}
