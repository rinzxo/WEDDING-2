'use client';

import { useEffect } from 'react';

export default function ScrollRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.classList.add('active');
            // Once visible, we unobserve so animation stays crisp
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const observeAll = () => {
      const elements = document.querySelectorAll('.reveal, .af, .reveal-scale, .reveal-fade, .line-expand');
      elements.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          observer.observe(el);
        }
      });
    };

    observeAll();

    // Re-check after 500ms in case fonts or dynamic components loaded
    const timeout = setTimeout(observeAll, 500);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return null;
}
