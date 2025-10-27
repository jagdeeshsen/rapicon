    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observe all elements with animation class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        const scrollTop = window.pageYOffset;

        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Scroll to top button
    window.addEventListener('scroll', () => {
        const scrollButton = document.querySelector('.scroll-to-top');
        if (window.pageYOffset > 300) {
            scrollButton.classList.add('show');
        } else {
            scrollButton.classList.remove('show');
        }
    });

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Animate counters
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(progress * target);
            element.textContent = current.toLocaleString() + '+';

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // Start counter animations when stats section is visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Only animate once
                statsObserver.unobserve(entry.target);

                // Animate all counters
                setTimeout(()=>{
                    animateCounter(document.getElementById('designCount'), 10000);
                }, 200);
                setTimeout(() => {
                    animateCounter(document.getElementById('vendorCount'), 500);
                }, 400);
                setTimeout(() => {
                    animateCounter(document.getElementById('userCount'), 25000);
                }, 600);
                setTimeout(() => {
                    animateCounter(document.getElementById('downloadCount'), 100000);
                }, 800);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(document.querySelector('.stats'));

    // Mobile menu toggle
    function toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-toggle');

        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    }

    // Add mobile menu styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-menu.active {
                display: flex;
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 999;
            }

            .mobile-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }

            .mobile-toggle.active span:nth-child(2) {
                opacity: 0;
            }

            .mobile-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
        }
    `;
    document.head.appendChild(style);

    // Check if user is already logged in and update navigation
    window.addEventListener('load', function() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const navButtons = document.querySelector('.nav-buttons');

        if (token && user.role) {
            // User is logged in, update navigation buttons
            let dashboardUrl = '';
            let userLabel = '';

            switch(user.role) {
                case 'admin':
                    dashboardUrl = 'admin-dashboard.html';
                    userLabel = 'Admin Dashboard';
                    break;
                case 'vendor':
                    dashboardUrl = 'vendor-dashboard.html';
                    userLabel = 'Vendor Dashboard';
                    break;
                case 'user':
                    dashboardUrl = 'user-catalog.html';
                    userLabel = 'My Account';
                    break;
                default:
                    dashboardUrl = 'user-catalog.html';
                    userLabel = 'Dashboard';
            }

            navButtons.innerHTML = `
                <a href="${dashboardUrl}" class="btn btn-outline">${userLabel}</a>
                <button class="btn btn-primary" onclick="logout()">Logout</button>
            `;
        } else {
            // User is NOT logged in - show browse and login options
            navButtons.innerHTML = `
                <a href="user.html" class="btn btn-outline">Browse Designs</a>
                <a href="login.html" class="btn btn-primary">Login</a>
            `;
        }
    });

    // Logout function
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        location.reload();
    }

    // Add some interactive elements
    document.addEventListener('DOMContentLoaded', function() {
        // Add hover effect to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Add parallax effect to hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            const rate = scrolled * -0.5;

            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        });

        // Typing effect for hero title
        const heroTitle = document.querySelector('.hero h1');
        const titleText = heroTitle.textContent;
        heroTitle.textContent = '';

        let i = 0;
        function typeWriter() {
            if (i < titleText.length) {
                heroTitle.textContent += titleText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }

        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);

        // Add floating animation to hero buttons
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        heroButtons.forEach((btn, index) => {
            btn.style.animationDelay = `${1.5 + (index * 0.2)}s`;
            btn.style.animation = 'fadeInUp 0.8s ease-out forwards';
            btn.style.opacity = '0';
        });

        // Add click ripple effect to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple effect styles
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            .btn {
                position: relative;
                overflow: hidden;
            }

            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                animation: ripple-effect 0.6s linear;
                pointer-events: none;
            }

            @keyframes ripple-effect {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);
    });

    // Add search functionality to hero section
    function addSearchToHero() {
        const heroContent = document.querySelector('.hero-content');
        const searchHTML = `
            <div style="margin: 30px 0; max-width: 500px; margin-left: auto; margin-right: auto;">
                <div style="display: flex; background: rgba(255,255,255,0.1); border-radius: 50px; padding: 5px; backdrop-filter: blur(10px);">
                    <input type="text" placeholder="Search for designs..." style="flex: 1; background: transparent; border: none; padding: 15px 20px; color: white; outline: none; font-size: 16px;" onkeypress="handleHeroSearch(event)">
                    <button onclick="performHeroSearch()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 12px 20px; border-radius: 45px; cursor: pointer; font-size: 16px;">🔍</button>
                </div>
            </div>
        `;

        const heroP = heroContent.querySelector('p');
        heroP.insertAdjacentHTML('afterend', searchHTML);
    }

    // Handle hero search
    function handleHeroSearch(event) {
        if (event.key === 'Enter') {
            performHeroSearch();
        }
    }

    function performHeroSearch() {
        const searchInput = document.querySelector('.hero input');
        const query = searchInput.value.trim();

        if (query) {
            // Redirect to catalog with search query
            window.location.href = `user-catalog.html?search=${encodeURIComponent(query)}`;
        } else {
            window.location.href = 'user-catalog.html';
        }
    }

    // Add search to hero after DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(addSearchToHero, 2000);
    });

    // Performance optimization: Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }