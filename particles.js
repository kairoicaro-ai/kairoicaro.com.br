/**
 * KIAA — Particle Network Canvas
 * Lightweight animated background for hero sections.
 * Creates subtle connected particles in brand colors.
 * ~3KB, no dependencies, uses requestAnimationFrame.
 */
(function () {
    'use strict';

    // --- Reduced motion: respect user preference ---
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var hero = document.querySelector('.hero');
    if (!hero) return;

    // --- Create canvas ---
    var canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;
    var particles = [];
    var PARTICLE_COUNT = 40;
    var CONNECTION_DIST = 140;
    var mouse = { x: -1000, y: -1000 };
    var rafId;

    // Brand colors
    var GREEN = { r: 134, g: 230, b: 0 };    // #86E600
    var WHITE = { r: 255, g: 255, b: 255 };

    // --- Resize handler ---
    function resize() {
        var rect = hero.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // --- Particle class ---
    function Particle() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.5;
        // 30% green, 70% white
        this.color = Math.random() < 0.3 ? GREEN : WHITE;
        this.baseAlpha = Math.random() * 0.3 + 0.1;
    }

    Particle.prototype.update = function () {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
    };

    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.baseAlpha + ')';
        ctx.fill();
    };

    // --- Init particles ---
    function initParticles() {
        particles = [];
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    // --- Draw connections ---
    function drawConnections() {
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    var alpha = (1 - dist / CONNECTION_DIST) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(' + GREEN.r + ',' + GREEN.g + ',' + GREEN.b + ',' + alpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            // Mouse proximity connection
            var mdx = particles[i].x - mouse.x;
            var mdy = particles[i].y - mouse.y;
            var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < CONNECTION_DIST * 1.5) {
                var mAlpha = (1 - mDist / (CONNECTION_DIST * 1.5)) * 0.2;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = 'rgba(' + GREEN.r + ',' + GREEN.g + ',' + GREEN.b + ',' + mAlpha + ')';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }

    // --- Animation loop ---
    function animate() {
        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        drawConnections();
        rafId = requestAnimationFrame(animate);
    }

    // --- Mouse tracking (throttled) ---
    var mouseThrottle = false;
    hero.addEventListener('mousemove', function (e) {
        if (mouseThrottle) return;
        mouseThrottle = true;
        var rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        setTimeout(function () { mouseThrottle = false; }, 30);
    }, { passive: true });

    hero.addEventListener('mouseleave', function () {
        mouse.x = -1000;
        mouse.y = -1000;
    }, { passive: true });

    // --- Visibility: pause when off-screen ---
    var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
            if (!rafId) animate();
        } else {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }, { threshold: 0.1 });

    // --- Start ---
    resize();
    initParticles();
    observer.observe(hero);
    animate();

    // Debounced resize
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            initParticles();
        }, 250);
    }, { passive: true });
})();
