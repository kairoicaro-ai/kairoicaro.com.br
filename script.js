/* ============================================================
   KAIRO ÍCARO — ADVOGADOS ASSOCIADOS
   Interactive Scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ==================== NAVBAR SCROLL EFFECT ====================
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 60;

    function handleNavScroll() {
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ==================== MOBILE MENU ====================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ==================== SMOOTH SCROLL for anchor links ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==================== SCROLL INDICATOR ====================
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('sobre');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ==================== COUNTER ANIMATION ====================
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        counters.forEach(counter => {
            if (counter.dataset.animated) return;
            
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = performance.now();
            
            function easeOutQuart(t) {
                return 1 - Math.pow(1 - t, 4);
            }
            
            function update(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutQuart(progress);
                const current = Math.round(target * easedProgress);
                
                counter.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                    counter.dataset.animated = 'true';
                }
            }
            
            requestAnimationFrame(update);
        });
    }

    // ==================== SCROLL REVEAL ANIMATIONS ====================
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        const windowHeight = window.innerHeight;
        
        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const revealPoint = 100;
            
            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });

        // Trigger counter animation when stats are visible
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            const rect = heroStats.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                animateCounters();
            }
        }
    }

    // Add reveal class to animatable elements
    const animatableSelectors = [
        '.about-content',
        '.about-visual',
        '.area-card',
        '.area-card-mini',
        '.diff-card',
        '.news-card',
        '.cta-content',
        '.section-header'
    ];

    animatableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${index * 0.1}s`;
        });
    });

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    
    // Initial trigger
    setTimeout(revealOnScroll, 100);

    // ==================== ACTIVE NAV LINK on scroll ====================
    const sections = document.querySelectorAll('.section, .hero');
    const navLinksAll = document.querySelectorAll('.nav-link');

    function highlightNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinksAll.forEach(link => {
            link.classList.remove('nav-active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('nav-active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink, { passive: true });

    // ==================== PARALLAX for Hero ====================
    const heroBgImg = document.querySelector('.hero-bg-img');
    
    if (heroBgImg && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBgImg.style.transform = `scale(${1.05 + scrolled * 0.0002}) translateY(${scrolled * 0.15}px)`;
            }
        }, { passive: true });
    }

    // ==================== LGPD COOKIE BANNER ====================
    const lgpdBanner = document.getElementById('lgpd-banner');
    const lgpdAccept = document.getElementById('lgpd-accept');

    if (lgpdBanner && lgpdAccept) {
        if (!localStorage.getItem('lgpd-accepted')) {
            lgpdBanner.style.display = 'flex';
        }

        lgpdAccept.addEventListener('click', () => {
            localStorage.setItem('lgpd-accepted', 'true');
            lgpdBanner.style.display = 'none';
        });
    }

    // ==================== INSIGHTS HUB (CONTEUDO DINAMICO) ====================
    const conteudoGrid = document.getElementById('conteudo-grid');
    const btnVerMaisConteudo = document.getElementById('btn-ver-mais-conteudo');
    let allConteudo = [];
    let currentTypeFilter = 'todos';
    let visibleConteudo = 6;

    function formatDateBR(dateStr) {
        if (!dateStr) return '';
        const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${months[parseInt(parts[1])-1]} ${parts[0]}`;
        }
        return dateStr;
    }

    function renderConteudoCard(item) {
        const hasImage = item.image && item.featured;
        const hasUrl = item.url && item.url.length > 0;
        const typeLabels = { artigo: 'Artigo', alerta: 'Alerta', guia: 'Guia Prático' };

        if (hasImage) {
            return `
            <article class="news-card reveal">
                <div class="news-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <span class="news-category">${item.category}</span>
                </div>
                <div class="news-content">
                    <span class="news-type-badge" data-type="${item.type}">${typeLabels[item.type] || item.type}</span>
                    <time class="news-date">${formatDateBR(item.date)}</time>
                    <h3>${item.title}</h3>
                    <p>${item.summary}</p>
                    ${hasUrl
                        ? `<a href="${item.url}" target="_blank" class="news-link">Leia mais <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>`
                        : `<span class="news-link news-link-soon">Em breve <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></span>`
                    }
                </div>
            </article>`;
        }

        return `
        <article class="news-card-text reveal">
            <span class="news-type-badge" data-type="${item.type}">${typeLabels[item.type] || item.type}</span>
            <span class="news-category" style="position:static;display:inline-block;margin-bottom:8px;">${item.category}</span>
            <time class="news-date">${formatDateBR(item.date)}</time>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            ${hasUrl
                ? `<a href="${item.url}" target="_blank" class="news-link">Leia mais <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>`
                : `<span class="news-link news-link-soon">Em breve <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></span>`
            }
        </article>`;
    }

    function renderConteudo() {
        if (!conteudoGrid) return;

        const filtered = currentTypeFilter === 'todos'
            ? allConteudo
            : allConteudo.filter(item => item.type === currentTypeFilter);

        if (filtered.length === 0) {
            conteudoGrid.innerHTML = '<div class="informativos-empty">Nenhuma publicação encontrada.</div>';
            if (btnVerMaisConteudo) btnVerMaisConteudo.style.display = 'none';
            return;
        }

        const toShow = filtered.slice(0, visibleConteudo);
        conteudoGrid.innerHTML = toShow.map(renderConteudoCard).join('');

        if (btnVerMaisConteudo) {
            btnVerMaisConteudo.style.display = filtered.length > visibleConteudo ? 'inline-flex' : 'none';
        }

        // Trigger reveal
        conteudoGrid.querySelectorAll('.reveal').forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.08}s`;
            setTimeout(() => el.classList.add('active'), 50);
        });
    }

    function loadConteudo() {
        if (!conteudoGrid) return;

        fetch('data/conteudo.json')
            .then(res => { if (!res.ok) throw new Error('Falha'); return res.json(); })
            .then(data => {
                allConteudo = (data.items || []).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
                renderConteudo();
            })
            .catch(() => {
                conteudoGrid.innerHTML = '<div class="informativos-empty">Conteúdo em atualização.</div>';
            });
    }

    // Content type filter handlers
    document.querySelectorAll('.content-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.content-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTypeFilter = btn.dataset.type;
            visibleConteudo = 6;
            renderConteudo();
        });
    });

    if (btnVerMaisConteudo) {
        btnVerMaisConteudo.addEventListener('click', () => {
            visibleConteudo += 6;
            renderConteudo();
        });
    }

    loadConteudo();

    // ==================== INFORMATIVOS DOS TRIBUNAIS ====================
    const informativosGrid = document.getElementById('informativos-grid');
    const btnVerMais = document.getElementById('btn-ver-mais-informativos');
    const informativosUpdated = document.getElementById('informativos-updated');
    let allInformativos = [];
    let currentFilter = 'todos';
    let visibleCount = 6;

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    function renderInformativos() {
        if (!informativosGrid) return;

        const filtered = currentFilter === 'todos'
            ? allInformativos
            : allInformativos.filter(item => item.tribunal === currentFilter);

        if (filtered.length === 0) {
            informativosGrid.innerHTML = '<div class="informativos-empty">Nenhum informativo encontrado para este tribunal.</div>';
            if (btnVerMais) btnVerMais.style.display = 'none';
            return;
        }

        const toShow = filtered.slice(0, visibleCount);

        informativosGrid.innerHTML = toShow.map(item => `
            <article class="informativo-card reveal">
                <div class="informativo-header">
                    <span class="tribunal-badge" data-tribunal="${item.tribunal}">${item.tribunal}</span>
                    <time class="informativo-date">${formatDate(item.date)}</time>
                </div>
                <div class="informativo-body">
                    <h3>${item.title}</h3>
                    <p>${item.summary || ''}</p>
                    <a href="${item.url}" target="_blank" rel="noopener" class="informativo-link">
                        Leia no tribunal
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </a>
                </div>
            </article>
        `).join('');

        // Show/hide ver mais button
        if (btnVerMais) {
            btnVerMais.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
        }

        // Trigger reveal animations on new cards
        informativosGrid.querySelectorAll('.informativo-card').forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.08}s`;
            setTimeout(() => el.classList.add('active'), 50);
        });
    }

    function loadInformativos() {
        if (!informativosGrid) return;

        fetch('data/informativos.json')
            .then(res => {
                if (!res.ok) throw new Error('Falha ao carregar');
                return res.json();
            })
            .then(data => {
                allInformativos = data.items || [];
                renderInformativos();

                // Show update timestamp
                if (informativosUpdated && data.updated_at) {
                    const dt = new Date(data.updated_at);
                    informativosUpdated.textContent = `Atualizado em ${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
                }
            })
            .catch(() => {
                informativosGrid.innerHTML = '<div class="informativos-empty">Informativos em atualização. Tente novamente em instantes.</div>';
            });
    }

    // Tab click handlers
    document.querySelectorAll('.tribunal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tribunal-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.tribunal;
            visibleCount = 6;
            renderInformativos();
        });
    });

    // Ver mais button
    if (btnVerMais) {
        btnVerMais.addEventListener('click', () => {
            visibleCount += 6;
            renderInformativos();
        });
    }

    // Load informativos on page load
    loadInformativos();

    // ==================== NEWSLETTER FORM ====================
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterSuccess = document.getElementById('newsletter-success');
    const newsletterSubmit = document.getElementById('newsletter-submit');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(newsletterForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                interest: formData.get('interest'),
                date: new Date().toISOString()
            };

            // Disable button during submission
            if (newsletterSubmit) {
                newsletterSubmit.disabled = true;
                newsletterSubmit.textContent = 'Enviando...';
            }

            // Store locally as fallback (will integrate with email service later)
            try {
                const subscribers = JSON.parse(localStorage.getItem('kiaa-newsletter') || '[]');
                subscribers.push(data);
                localStorage.setItem('kiaa-newsletter', JSON.stringify(subscribers));
            } catch(err) { /* silent */ }

            // Show success message
            setTimeout(() => {
                newsletterForm.style.display = 'none';
                if (newsletterSuccess) newsletterSuccess.style.display = 'block';
            }, 800);
        });
    }

    // ==================== Console branding ====================
    console.log(
        '%cKairo Icaro — Advogados Associados',
        'background: #0F2944; color: #86E600; font-size: 16px; padding: 12px 20px; border-radius: 4px; font-family: Montserrat, sans-serif; font-weight: bold;'
    );
});
