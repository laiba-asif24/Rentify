import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button className="scroll-top-btn show" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <ChevronUp size={20} color="white" strokeWidth={2.5} />
    </button>
  );
};

export default ScrollToTop;