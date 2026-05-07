document.addEventListener('DOMContentLoaded', async () => {
    // Initialize smooth scrolling immediately
    initLenis();
    
    await loadComponents();
    
    // Initialize component-dependent features
    initTheme();
    initDynamicIsland();
    initMobileMenu();
    initServerStatus();
});

function initLenis() {
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth ease-out curve
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }
}

async function loadComponents() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navbarPlaceholder) {
        try {
            const res = await fetch('components/navbar.html');
            navbarPlaceholder.innerHTML = await res.text();
        } catch (e) { console.error('Error loading navbar', e); }
    }
    
    if (footerPlaceholder) {
        try {
            const res = await fetch('components/footer.html');
            footerPlaceholder.innerHTML = await res.text();
        } catch (e) { console.error('Error loading footer', e); }
    }
}

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    if (!themeToggle) return;

    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
    }

    themeToggle.addEventListener('click', () => {
        htmlEl.classList.toggle('dark');
        if (htmlEl.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }
    });
}

function initDynamicIsland() {
    const nav = document.getElementById('mainNav');
    const navContainer = nav?.querySelector('.nav-container');
    if (!nav || !navContainer) return;

    // Smoother transition classes
    nav.classList.add('transition-all', 'duration-[1200ms]', 'ease-[cubic-bezier(0.22,1,0.36,1)]');
    navContainer.classList.add('transition-all', 'duration-[1200ms]', 'ease-[cubic-bezier(0.22,1,0.36,1)]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            // Morph into Dynamic Island
            nav.classList.remove('w-full', 'rounded-none', 'bg-white/90', 'dark:bg-dark-card/90', 'border-b', 'top-0');
            nav.classList.add('w-[90%]', 'max-w-4xl', 'top-4', 'rounded-full', 'bg-white/80', 'dark:bg-dark-card/80', 'shadow-2xl', 'border', 'border-slate-200/50', 'dark:border-dark-border/50');
            navContainer.classList.remove('px-6');
            navContainer.classList.add('px-8');
        } else {
            // Default docked top state
            nav.classList.add('w-full', 'rounded-none', 'bg-white/90', 'dark:bg-dark-card/90', 'border-b', 'top-0');
            nav.classList.remove('w-[90%]', 'max-w-4xl', 'top-4', 'rounded-full', 'shadow-2xl', 'bg-white/80', 'dark:bg-dark-card/80', 'border', 'border-slate-200/50', 'dark:border-dark-border/50');
            navContainer.classList.add('px-6');
            navContainer.classList.remove('px-8');
        }
    });
}

function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuCard = document.getElementById('mobile-menu-card');

    if (!hamburgerBtn || !mobileMenu) return;

    function toggleMenu() {
        const iconMenu = document.getElementById('hamburger-icon-menu');
        const iconClose = document.getElementById('hamburger-icon-close');
        const isOpen = !mobileMenu.classList.contains('opacity-0');
        
        if (!isOpen) {
            // Open Menu
            iconMenu?.classList.add('scale-0', 'opacity-0', 'rotate-90');
            iconMenu?.classList.remove('scale-100', 'opacity-100', 'rotate-0');
            
            iconClose?.classList.remove('scale-0', 'opacity-0', '-rotate-90');
            iconClose?.classList.add('scale-100', 'opacity-100', 'rotate-0');
            
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
            
            if (mobileMenuCard) {
                mobileMenuCard.classList.remove('scale-95', 'translate-y-8');
                mobileMenuCard.classList.add('scale-100', 'translate-y-0');
            }
        } else {
            // Close Menu
            iconClose?.classList.add('scale-0', 'opacity-0', '-rotate-90');
            iconClose?.classList.remove('scale-100', 'opacity-100', 'rotate-0');
            
            iconMenu?.classList.remove('scale-0', 'opacity-0', 'rotate-90');
            iconMenu?.classList.add('scale-100', 'opacity-100', 'rotate-0');
            
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
            
            if (mobileMenuCard) {
                mobileMenuCard.classList.add('scale-95', 'translate-y-8');
                mobileMenuCard.classList.remove('scale-100', 'translate-y-0');
            }
        }
    }

    hamburgerBtn.addEventListener('click', toggleMenu);

    // Close when clicking outside the card
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            toggleMenu();
        }
    });
}

// Backend Polling & Wake functionality
async function initServerStatus() {
    const pingBtn = document.getElementById('serverPingBtn');
    const pingDot = document.getElementById('serverPingDot');
    const pingPulse = document.getElementById('serverPingPulse');
    const pingText = document.getElementById('serverPingText');
    
    if (!pingBtn) return;

    const BACKEND_URL = 'http://127.0.0.1:8000/';

    const updateStatusUI = (isOnline) => {
        if (isOnline) {
            pingDot.className = 'relative inline-flex rounded-full h-full w-full bg-emerald-500 transition-colors duration-300';
            pingPulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75';
            pingText.textContent = 'Online';
            pingText.className = 'text-xs font-bold text-emerald-600 dark:text-emerald-400';
        } else {
            pingDot.className = 'relative inline-flex rounded-full h-full w-full bg-red-500 transition-colors duration-300';
            pingPulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75';
            pingText.textContent = 'Offline';
            pingText.className = 'text-xs font-bold text-red-600 dark:text-red-400';
        }
    };

    const checkServer = async () => {
        pingText.textContent = 'Pinging...';
        try {
            // Ping the root health endpoint
            const res = await fetch(BACKEND_URL);
            if (res.ok) {
                updateStatusUI(true);
            } else {
                updateStatusUI(false);
            }
        } catch (error) {
            updateStatusUI(false);
        }
    };

    // Initial check
    checkServer();

    // Re-check on click (manual wake)
    pingBtn.addEventListener('click', () => {
        checkServer();
    });

    // Auto poll every 30 seconds to keep Hugging Face space awake if needed
    setInterval(checkServer, 30000);
}
