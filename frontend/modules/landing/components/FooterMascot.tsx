'use client';

import { useEffect, useRef } from 'react';

type MascotMotion = 'idle' | 'walk' | 'jump';

export default function FooterMascot() {
  const trackRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const character = characterRef.current;
    const footer = track?.closest('footer');
    if (!track || !character || !footer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let currentX = character.offsetWidth / 2;
    let targetX = currentX;
    let walkUntil = 0;
    let jumpUntil = 0;

    const setMotion = (motion: MascotMotion) => {
      if (character.dataset.motion !== motion) character.dataset.motion = motion;
    };

    const animate = (now: number) => {
      const difference = targetX - currentX;
      const isWalking = Math.abs(difference) > 0.5;

      if (isWalking) {
        currentX += difference * 0.18;
        if (Math.abs(targetX - currentX) < 0.5) currentX = targetX;
        character.style.transform = `translate3d(${currentX}px, 0, 0)`;
      }

      if (now < jumpUntil) setMotion('jump');
      else if (isWalking || now < walkUntil) setMotion('walk');
      else setMotion('idle');

      if (isWalking || now < jumpUntil || now < walkUntil) {
        animationFrame = window.requestAnimationFrame(animate);
      } else {
        animationFrame = 0;
      }
    };

    const scheduleAnimation = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;

      const footerBounds = footer.getBoundingClientRect();
      const isInsideFooter =
        event.clientX >= footerBounds.left &&
        event.clientX <= footerBounds.right &&
        event.clientY >= footerBounds.top &&
        event.clientY <= footerBounds.bottom;

      if (!isInsideFooter) {
        if (performance.now() < walkUntil) {
          targetX = currentX;
          walkUntil = 0;
          scheduleAnimation();
        }
        return;
      }

      const trackBounds = track.getBoundingClientRect();
      const halfCharacter = character.offsetWidth / 2;
      const minX = halfCharacter;
      const maxX = Math.max(minX, trackBounds.width - halfCharacter);
      targetX = Math.min(maxX, Math.max(minX, event.clientX - trackBounds.left));
      character.dataset.direction = targetX < currentX ? 'left' : 'right';
      walkUntil = performance.now() + 180;
      scheduleAnimation();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      if (!(event.target instanceof Element) || event.target.closest('a, button, input, iframe')) return;

      const footerBounds = footer.getBoundingClientRect();
      const isInsideFooter =
        event.clientX >= footerBounds.left &&
        event.clientX <= footerBounds.right &&
        event.clientY >= footerBounds.top &&
        event.clientY <= footerBounds.bottom;
      if (!isInsideFooter) return;

      jumpUntil = performance.now() + 650;
      scheduleAnimation();
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        targetX = currentX;
        walkUntil = 0;
        jumpUntil = 0;
        setMotion('idle');
      }
    };

    if (reducedMotion.matches) return;

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    reducedMotion.addEventListener('change', onMotionPreferenceChange);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div ref={trackRef} className="footer-mascot-track content-width" aria-hidden="true">
      <div
        ref={characterRef}
        className="footer-mascot-character"
        data-motion="idle"
        data-direction="right"
      >
        <div className="footer-mascot-face">
          <span className="footer-mascot-sprite footer-mascot-idle" />
          <span className="footer-mascot-sprite footer-mascot-walk" />
          <span className="footer-mascot-sprite footer-mascot-jump" />
        </div>
      </div>
    </div>
  );
}
