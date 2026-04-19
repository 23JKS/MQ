const select = (selector, all = false) => {
    return all ? Array.from(document.querySelectorAll(selector)) : document.querySelector(selector);
};

const selectAll = (selector) => select(selector, true);

// 滚动动画观察器
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // 观察需要动画的元素
    const animatedElements = selectAll('.product-card, .adv-item, .stat-item, .section-header');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
};

// 导航栏滚动效果
const handleNavbarScroll = () => {
    const navbar = select('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 6px 40px rgba(0,0,0,0.2)';
        } else {
            navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.12)';
        }

        lastScroll = currentScroll;
    });
};

// 平滑滚动
const initSmoothScroll = () => {
    selectAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = select(href);
            if (target) {
                const offsetTop = target.offsetTop - 90;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
};

const setActiveNavLink = () => {
    const currentPath = window.location.pathname.split('/').pop();
    selectAll('.nav-links a').forEach((link) => {
        const href = link.getAttribute('href');
        const parent = link.parentElement;

        if (!parent) {
            return;
        }

        if (href === currentPath || (href === 'index.html' && !currentPath)) {
            parent.classList.add('active');
        } else {
            parent.classList.remove('active');
        }
    });
};

const initProductModal = () => {
    const cards = selectAll('.product-card[data-title], .product-item[data-title]');
    const modal = select('#productModal');

    if (!modal || cards.length === 0) {
        return;
    }

    const title = modal.querySelector('.modal-title');
    const description = modal.querySelector('.modal-description');
    const list = modal.querySelector('.modal-list');
    const closeButton = modal.querySelector('.modal-close');

    const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const openModal = (card) => {
        title.textContent = card.dataset.title || '';
        description.textContent = card.dataset.description || '';
        list.innerHTML = '';

        const features = (card.dataset.features || '').split('、').filter(Boolean);
        features.forEach((feature) => {
            const listItem = document.createElement('li');
            listItem.textContent = feature;
            list.appendChild(listItem);
        });

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => openModal(card));
    });

    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.classList.contains('product-modal-backdrop')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
};

const showFormStatus = (statusElement, message, isError = false) => {
    statusElement.textContent = message;
    statusElement.classList.toggle('error', isError);
};

const initContactForm = () => {
    const form = select('.contact-form');

    if (!form) {
        return;
    }

    const status = form.querySelector('.form-status');
    const inputs = Array.from(form.querySelectorAll('input, textarea'));

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        let isValid = true;
        inputs.forEach((input) => {
            input.classList.remove('input-error');
        });

        const name = form.querySelector('#name');
        const phone = form.querySelector('#phone');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');

        if (!name.value.trim()) {
            name.classList.add('input-error');
            isValid = false;
        }

        if (!phone.value.trim()) {
            phone.classList.add('input-error');
            isValid = false;
        }

        if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            email.classList.add('input-error');
            isValid = false;
        }

        if (!message.value.trim()) {
            message.classList.add('input-error');
            isValid = false;
        }

        if (!isValid) {
            showFormStatus(status, '请填写所有必填项并确保邮箱格式正确。', true);
            return;
        }

        showFormStatus(status, '感谢您的留言，我们已收到您的信息，会尽快与您联系。', false);
        form.reset();
    });
};

const init = async () => {
    await initI18n();
    setActiveNavLink();
    initProductModal();
    initContactForm();
    observeElements();
    handleNavbarScroll();
    initSmoothScroll();
    initWechatFloat();
    initProductsNav();
    initHeroSlider();
    initLanguageSwitcher();
};

// 微信悬浮按钮交互
const initWechatFloat = () => {
    const wechatFloat = select('.wechat-float');
    const wechatBtn = select('.wechat-btn');
    
    if (!wechatBtn || !wechatFloat) return;
    
    // 点击按钮切换二维码显示
    wechatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        wechatFloat.classList.toggle('active');
    });
    
    // 点击页面其他地方关闭二维码
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.wechat-float')) {
            wechatFloat.classList.remove('active');
        }
    });
};

document.addEventListener('DOMContentLoaded', init);


// ================= 多语言支持 (i18next) =================

// 初始化 i18next
const setHtmlLang = (lang) => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : (lang === 'ja' ? 'ja-JP' : 'en-US');
};

const initI18n = async () => {
    // 检查 i18next 是否已加载
    if (typeof i18next === 'undefined') {
        console.error('i18next library not loaded');
        return;
    }

    // 从 localStorage 获取保存的语言，默认为中文
    let savedLang = localStorage.getItem('language') || 'zh';
    if (!['zh', 'en', 'ja'].includes(savedLang)) {
        savedLang = 'zh';
    }
    console.log('Initializing i18next with language:', savedLang);

    try {
        await i18next
            .use(i18nextHttpBackend)
            .init({
                lng: savedLang,
                fallbackLng: 'zh',
                debug: true,
                backend: {
                    loadPath: 'lang/{{lng}}.json'
                }
            });

        console.log('i18next initialized successfully, current language:', i18next.language);
        setHtmlLang(i18next.language);

        // 更新页面内容
        updateContent();
    } catch (error) {
        console.error('Failed to initialize i18next:', error);
    }
};

// 更新页面内容
const updateContent = () => {
    // 更新所有带 data-i18n 属性的元素
    selectAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = i18next.t(key);
        
        // 检查是否需要使用 HTML（用于包含 <br> 标签的内容）
        if (element.hasAttribute('data-i18n-html')) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // 更新所有带 data-i18n-placeholder 属性的元素
    selectAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = i18next.t(key);
        element.placeholder = translation;
    });
};

// 初始化语言切换按钮
const initLanguageSwitcher = () => {
    const langButtons = selectAll('.lang-btn');
    
    if (langButtons.length === 0) return;
    
    // 从 localStorage 获取当前语言，确保与 i18next 一致
    const currentLang = localStorage.getItem('language') || i18next.language || 'zh';
    
    // 设置当前激活的语言按钮
    langButtons.forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        if (lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    setHtmlLang(currentLang);
    
    // 添加点击事件
    langButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const lang = btn.getAttribute('data-lang');
            
            // 切换语言
            await i18next.changeLanguage(lang);
            
            // 保存到 localStorage
            localStorage.setItem('language', lang);
            
            // 更新按钮状态
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新页面内容
            updateContent();
            
            // 更新 HTML lang 属性
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : (lang === 'ja' ? 'ja-JP' : 'en-US');
        });
    });
};


// 产品中心导航交互
const initProductsNav = () => {
    const categoryItems = selectAll('.category-item');
    const productCategories = selectAll('.product-category');
    
    if (categoryItems.length === 0) return;
    
    // 点击导航项滚动到对应区域
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有active类
            categoryItems.forEach(i => i.classList.remove('active'));
            // 添加当前active类
            item.classList.add('active');
            
            // 滚动到对应区域
            const targetId = item.getAttribute('href');
            const targetSection = select(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 120;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 滚动时高亮当前区域
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-120px 0px -50% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                categoryItems.forEach(item => {
                    if (item.getAttribute('href') === `#${id}`) {
                        categoryItems.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    productCategories.forEach(category => observer.observe(category));
};


// 首屏轮播图
const initHeroSlider = () => {
    const slides = selectAll('.hero-slide');
    const prevBtn = select('.slider-prev');
    const nextBtn = select('.slider-next');
    const indicators = selectAll('.indicator');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let autoPlayInterval;
    
    const showSlide = (index) => {
        // 移除所有active类
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 添加当前active类
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        currentSlide = index;
    };
    
    const nextSlide = () => {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    };
    
    const prevSlide = () => {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    };
    
    // 自动播放
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(nextSlide, 5000);
    };
    
    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };
    
    // 按钮事件
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }
    
    // 指示器事件
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            stopAutoPlay();
            startAutoPlay();
        });
    });
    
    // 鼠标悬停暂停
    const heroSlider = select('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', stopAutoPlay);
        heroSlider.addEventListener('mouseleave', startAutoPlay);
    }
    
    // 启动自动播放
    startAutoPlay();
};
