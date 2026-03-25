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
        '.area-card-uniform',
        '.diff-card',
        '.news-card',
        '.fifa-card',
        '.award-card',
        '.cta-content',
        '.section-header',
        '.esg-pillar',
        '.dash-link-card',
        '.case-card',
        '.setorial-source-card',
        '.panel-embed-card'
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
    let currentMateriaFilter = 'todos';
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

        let filtered = currentFilter === 'todos'
            ? allInformativos
            : allInformativos.filter(item => item.tribunal === currentFilter);

        if (currentMateriaFilter !== 'todos') {
            filtered = filtered.filter(item => item.category === currentMateriaFilter);
        }

        if (filtered.length === 0) {
            informativosGrid.innerHTML = '<div class="informativos-empty">Nenhum informativo encontrado para os filtros selecionados.</div>';
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

    // Materia tab click handlers
    document.querySelectorAll('.materia-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.materia-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMateriaFilter = tab.dataset.materia;
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

    // ==================== PRAZOS REGULATÓRIOS ====================
    const prazosStrip = document.getElementById('prazos-strip');

    function loadPrazos() {
        if (!prazosStrip) return;

        fetch('data/prazos.json')
            .then(res => { if (!res.ok) throw new Error('Falha'); return res.json(); })
            .then(data => {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const limite = new Date(hoje);
                limite.setDate(limite.getDate() + 90);

                const proximos = (data.prazos || [])
                    .map(p => {
                        const d = new Date(p.date + 'T00:00:00');
                        const diffMs = d - hoje;
                        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                        return { ...p, dateObj: d, dias: diffDias };
                    })
                    .filter(p => p.dias >= 0 && p.dateObj <= limite)
                    .sort((a, b) => a.dias - b.dias);

                if (proximos.length === 0) {
                    prazosStrip.style.display = 'none';
                    return;
                }

                const areaColors = {
                    'Ambiental': '#2ecc71',
                    'Trabalhista': '#3498db',
                    'Tributário': '#e67e22',
                    'Agrário': '#8b5cf6'
                };

                const badges = proximos.map(p => {
                    const cor = areaColors[p.area] || '#6b7280';
                    const urgente = p.dias <= 14;
                    const diasTexto = p.dias === 0 ? 'Hoje' : p.dias === 1 ? '1 dia' : `${p.dias} dias`;
                    return `
                        <div class="prazo-badge${urgente ? ' prazo-urgente' : ''}" title="${p.desc}">
                            <span class="prazo-area" style="background:${cor}">${p.area}</span>
                            <span class="prazo-titulo">${p.title}</span>
                            <span class="prazo-countdown">${diasTexto}</span>
                        </div>
                    `;
                }).join('');

                prazosStrip.innerHTML = `
                    <div class="prazos-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>Alertas e Prazos</span>
                    </div>
                    <div class="prazos-badges">${badges}</div>
                `;
            })
            .catch(() => {
                if (prazosStrip) prazosStrip.style.display = 'none';
            });
    }

    loadPrazos();

    // ==================== DASHBOARD TABS ====================
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById('panel-' + tab.dataset.panel);
            if (panel) panel.classList.add('active');
        });
    });

    // ==================== RADAR SEARCH TABS ====================
    document.querySelectorAll('.radar-search-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.radar-search-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const input = document.getElementById('radar-input');
            const placeholders = { car: 'Digite o número do CAR', cpf: 'Digite o CPF ou CNPJ', imovel: 'Digite o nome do imóvel' };
            if (input) input.placeholder = placeholders[tab.dataset.search] || '';
        });
    });

    // ==================== SETORIAL NEWS LOADER ====================
    const setorialGrid = document.getElementById('setorial-grid');
    let allSetoriais = [];
    let currentSetorialFilter = 'todos';

    function renderSetoriais() {
        if (!setorialGrid) return;
        const filtered = currentSetorialFilter === 'todos' ? allSetoriais : allSetoriais.filter(i => i.setor === currentSetorialFilter);
        if (filtered.length === 0) {
            setorialGrid.innerHTML = '<div class="informativos-empty">Nenhuma notícia encontrada.</div>';
            return;
        }
        setorialGrid.innerHTML = filtered.map(item => `
            <article class="news-card-text reveal">
                <span class="news-type-badge" data-type="${item.setor === 'varejo' ? 'guia' : item.setor === 'ambiental' ? 'alerta' : 'artigo'}">${item.setor === 'varejo' ? 'Varejo' : item.setor === 'ambiental' ? 'Ambiental' : 'Empresarial'}</span>
                <span class="news-category" style="position:static;display:inline-block;margin-bottom:8px;">${item.source}</span>
                <time class="news-date">${item.date ? item.date.split('-').reverse().join('/') : ''}</time>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
                ${item.url ? `<a href="${item.url}" target="_blank" class="news-link">Leia mais →</a>` : '<span class="news-link news-link-soon">Análise KIAA</span>'}
            </article>
        `).join('');
        setorialGrid.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${i*0.08}s`; setTimeout(() => el.classList.add('active'), 50); });
    }

    function loadSetoriais() {
        if (!setorialGrid) return;
        fetch('data/setoriais.json')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => { allSetoriais = (d.items || []).sort((a,b) => (b.date||'').localeCompare(a.date||'')); renderSetoriais(); })
            .catch(() => { setorialGrid.innerHTML = '<div class="informativos-empty">Notícias em atualização.</div>'; });
    }

    document.querySelectorAll('.setorial-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.setorial-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentSetorialFilter = tab.dataset.setorial;
            renderSetoriais();
        });
    });

    loadSetoriais();

    // ==================== CAROUSEL ARROWS ====================
    const carouselTrack = document.querySelector('.clients-track');
    document.getElementById('carousel-left')?.addEventListener('click', () => {
        if (carouselTrack) carouselTrack.scrollLeft -= 200;
    });
    document.getElementById('carousel-right')?.addEventListener('click', () => {
        if (carouselTrack) carouselTrack.scrollLeft += 200;
    });

    // ==================== Console branding ====================
    console.log(
        '%cKairo Icaro — Advogados Associados',
        'background: #0F2944; color: #86E600; font-size: 16px; padding: 12px 20px; border-radius: 4px; font-family: Montserrat, sans-serif; font-weight: bold;'
    );
});
