/**
 * KIAA — GSAP ScrollTrigger Animations
 * Uses gsap.fromTo() exclusively to prevent elements getting stuck invisible.
 */
(function() {
    'use strict';
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // --- Hero entrance sequence ---
    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    var heroBadge = document.querySelector('.hero-badge');
    var heroTitle = document.querySelector('.hero-title');
    var heroSubtitle = document.querySelector('.hero-subtitle');
    var heroActions = document.querySelector('.hero-actions, .hero-buttons, .hero-cta');

    // Hero animation: NEVER hide elements. Only add subtle motion enhancement.
    // Elements are always visible via CSS. GSAP adds polish on top.
    if (heroBadge) {
        heroTl.from(heroBadge, { y: 15, duration: 0.6, clearProps: 'transform' });
    }
    if (heroTitle) {
        heroTl.from(heroTitle, { y: 20, duration: 0.8, ease: 'power4.out', clearProps: 'transform' }, heroBadge ? '-=0.3' : 0);
    }
    if (heroSubtitle) {
        heroTl.from(heroSubtitle, { y: 15, duration: 0.8, clearProps: 'transform' }, '-=0.5');
    }
    if (heroActions) {
        heroTl.from(heroActions.children, { y: 10, duration: 0.5, stagger: 0.12, clearProps: 'transform' }, '-=0.4');
    }

    // --- Hero stats: subtle slide only (no opacity change to prevent invisible) ---
    gsap.utils.toArray('.hero-stats .stat').forEach(function(el, i) {
        gsap.from(el, {
            y: 15, duration: 0.6, delay: i * 0.12, ease: 'power2.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: '.hero-stats', start: 'top 90%', once: true }
        });
    });

    // --- Section headers ---
    gsap.utils.toArray('.section-header').forEach(function(el) {
        gsap.fromTo(el,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
        );
    });

    // --- About content: slide from left ---
    gsap.utils.toArray('.about-content, .about-grid > :first-child').forEach(function(el) {
        gsap.fromTo(el,
            { x: -40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 80%', once: true }
            }
        );
    });

    // --- About visual: slide from right ---
    gsap.utils.toArray('.about-visual, .about-grid > :last-child').forEach(function(el) {
        gsap.fromTo(el,
            { x: 40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 80%', once: true }
            }
        );
    });

    // --- Area cards / product cards: grid stagger ---
    ['produtos-grid', 'areas-grid', 'diff-grid'].forEach(function(cls) {
        var grid = document.querySelector('.' + cls);
        if (!grid) return;
        var items = grid.children;
        if (!items.length) return;
        gsap.fromTo(items,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1,
              scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
            }
        );
    });

    // --- Individual diff/feature cards ---
    gsap.utils.toArray('.diff-card, .feature-item').forEach(function(el, i) {
        gsap.fromTo(el,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, delay: i * 0.08, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
        );
    });

    // --- Case cards: alternate left/right ---
    gsap.utils.toArray('.case-card').forEach(function(el, i) {
        var xFrom = i % 2 === 0 ? -30 : 30;
        gsap.fromTo(el,
            { x: xFrom, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
        );
    });

    // --- Testimonials ---
    gsap.utils.toArray('.testimonial-card, .depoimento-card').forEach(function(el) {
        gsap.fromTo(el,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
        );
    });

    // --- CTA section ---
    gsap.utils.toArray('.cta-content').forEach(function(el) {
        gsap.fromTo(el,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
        );
    });

    // --- Team cards ---
    var teamGrid = document.querySelector('.team-grid, .team-highlight-grid, .equipe-grid');
    if (teamGrid) {
        gsap.fromTo(teamGrid.children,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.12,
              scrollTrigger: { trigger: teamGrid, start: 'top 80%', once: true }
            }
        );
    }

    // --- Methodology steps ---
    var methodGrid = document.querySelector('.method-grid, .metodologia-grid');
    if (methodGrid) {
        gsap.fromTo(methodGrid.children,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.15,
              scrollTrigger: { trigger: methodGrid, start: 'top 80%', once: true }
            }
        );
    }

    // --- Radar / special sections ---
    gsap.utils.toArray('.radar-section, .radar-ambiental-section').forEach(function(el) {
        var target = el.querySelector('.container') || el;
        gsap.fromTo(target,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 80%', once: true }
            }
        );
    });

    // --- Footer ---
    var footer = document.querySelector('.footer');
    if (footer) {
        gsap.fromTo(footer,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
              scrollTrigger: { trigger: footer, start: 'top 95%', once: true }
            }
        );
    }
})();
