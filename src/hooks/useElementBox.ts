import { useLayoutEffect, useState, type RefObject } from 'react';

export default function useElementContentRect(
  ref: RefObject<Element | null>
) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const update = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };

    update();

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(() => {
        update();
      });
    });

    window.addEventListener('resize', update);

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref]);

  return { rect };
}
