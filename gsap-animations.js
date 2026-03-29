/**
 * KIAA — GSAP ScrollTrigger Animations
 * Intentional, differentiated animations per element type.
 * Replaces generic stagger fade-in pattern.
 */
(function() {
    'use strict';
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var defaults = { once: true };

    // --- Hero entrance sequence (replaces CSS fadeInUp animations) ---
    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    var heroBadge = document.querySelector('.hero-badge');
    var heroTitle = document.querySelector('.hero-title');
    var heroSubtitle = document.querySelector('.hero-subtitle');
    var heroActions = document.querySelector('.hero-actions, .hero-buttons, .hero-cta');

    if (heroBadge) {
        heroTl.from(heroBadge, { y: 20, opacity: 0, duration: 0.6 });
    }
    if (heroTitle) {
        heroTl.from(heroTitle, {
            clipPath: 'inset(0 100% 0 0)',
            duration: 1.2,
            ease: 'power4.out'
        }, heroBadge ? '-=0.3' : 0);
    }
    if (heroSubtitle) {
        heroTl.from(heroSubtitle, { y: 20, opacity: 0, duration: 0.8 }, '-=0.5');
    }
    if (heroActions) {
        heroTl.from(heroActions.children, {
            y: 15, opacity: 0, duration: 0.5,
            stagger: 0.12
        }, '-=0.4');
    }

    // --- Hero stats: count up with subtle slide ---
    gsap.utils.toArray('.hero-stats .stat').forEach(function(el, i) {
        gsap.from(el, {
            y: 20, opacity: 0, duration: 0.6,
            delay: i * 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.hero-stats', start: 'top 90%', once: true }
        });
    });

    // --- Section headers: clean rise ---
    gsap.utils.toArray('.section-header').forEach(function(el) {
        gsap.from(el, {
            y: 40, opacity: 0, duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // --- About content: slide from left ---
    gsap.utils.toArray('.about-content, .about-grid > :first-child').forEach(function(el) {
        gsap.from(el, {
            x: -40, opacity: 0, duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true }
        });
    });

    // --- About visual / image: slide from right ---
    gsap.utils.toArray('.about-visual, .about-grid > :last-child').forEach(function(el) {
        gsap.from(el, {
            x: 40, opacity: 0, duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true }
        });
    });

    // --- Area cards / product cards: grid stagger ---
    ['produtos-grid', 'areas-grid', 'diff-grid'].forEach(function(cls) {
        var grid = document.querySelector('.' + cls);
        if (!grid) return;
        var items = grid.children;
        if (!items.length) return;
        gsap.from(items, {
            y: 40, opacity: 0, duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
        });
    });

    // --- Individual diff/feature cards: subtle rise ---
    gsap.utils.toArray('.diff-card, .feature-item').forEach(function(el, i) {
        gsap.from(el, {
            y: 30, opacity: 0, duration: 0.5,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // --- Case cards: alternate left/right ---
    gsap.utils.toArray('.case-card').forEach(function(el, i) {
        gsap.from(el, {
            x: i % 2 === 0 ? -30 : 30,
            opacity: 0, duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // --- Testimonials: fade with scale ---
    gsap.utils.toArray('.testimonial-card, .depoimento-card').forEach(function(el) {
        gsap.from(el, {
            scale: 0.95, opacity: 0, duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // --- CTA section: rise from bottom ---
    gsap.utils.toArray('.cta-content').forEach(function(el) {
        gsap.from(el, {
            y: 50, opacity: 0, duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // --- Team cards: stagger ---
    var teamGrid = document.querySelector('.team-grid, .team-highlight-grid, .equipe-grid');
    if (teamGrid) {
        gsap.from(teamGrid.children, {
            y: 30, opacity: 0, duration: 0.6,
            ease: 'power2.out',
            stagger: 0.12,
            scrollTrigger: { trigger: teamGrid, start: 'top 80%', once: true }
        });
    }

    // --- Methodology steps: sequential reveal ---
    var methodGrid = document.querySelector('.method-grid, .metodologia-grid');
    if (methodGrid) {
        gsap.from(methodGrid.children, {
            y: 25, opacity: 0, duration: 0.5,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: { trigger: methodGrid, start: 'top 80%', once: true }
        });
    }

    // --- Radar / special sections: scale up ---
    gsap.utils.toArray('.radar-section, .radar-ambiental-section').forEach(function(el) {
        gsap.from(el.querySelector('.container') || el, {
            y: 40, opacity: 0, duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true }
        });
    });

    // --- Footer: gentle fade ---
    var footer = document.querySelector('.footer');
    if (footer) {
        gsap.from(footer, {
            y: 20, opacity: 0, duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: footer, start: 'top 95%', once: true }
        });
    }
})();
