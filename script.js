/**
 * Vaypari — Complete Interactive Script (Clean Build)
 *
 * Covers:
 *  - Mobile menu open/close + overlay
 *  - Hero slider (pixel-based, auto-play, swipe, resize-safe)
 *  - Flash sale countdown timer
 *  - Add to Bag (cart counter + bounce animation + toast)
 *  - Wishlist toggle (counter + pop animation + toast)
 *  - Search suggestions (show/hide + enter key)
 *  - Newsletter form validation
 *  - Announcement bar close
 *  - Profile dropdown
 *  - Sticky header shadow on scroll
 *  - Back-to-top button
 *  - Scroll-reveal fade-in
 */

(function () {
    'use strict';

    /* --------------------------------------------------
       Tiny helpers
    -------------------------------------------------- */
    function g(id)         { return document.getElementById(id); }
    function q(s, c)       { return (c || document).querySelector(s); }
    function qa(s, c)      { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

    /* --------------------------------------------------
       Toast notification
    -------------------------------------------------- */
    function toast(msg, icon) {
        icon = icon || '✨';
        var box = q('.toast-container');
        if (!box) {
            box = document.createElement('div');
            box.className = 'toast-container';
            document.body.appendChild(box);
        }
        var t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = '<span>' + icon + '</span><span>' + msg + '</span>';
        box.appendChild(t);
        /* Let CSS slide-in-left animation handle the entrance */
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { t.classList.add('show'); });
        });
        setTimeout(function () {
            t.style.animation = 'slide-out-up .3s var(--ease-out-4) both';
            setTimeout(function () {
                t.classList.remove('show');
                setTimeout(function () {
                    if (t.parentNode) t.parentNode.removeChild(t);
                }, 320);
            }, 280);
        }, 3200);
    }

    /* =====================================================
       PRELOADER LOGIC
       ===================================================== */
    window.addEventListener('load', function () {
        var loader = document.getElementById('page-loader');
        if (loader) {
            // Give it a brief moment so the beautiful animation is seen
            setTimeout(function () {
                loader.classList.add('hidden');
                // Remove from DOM after fade completes
                setTimeout(function () {
                    if (loader.parentNode) loader.parentNode.removeChild(loader);
                }, 600);
            }, 800);
        }
    });

    /* ==================================================
       INIT — runs after DOM is ready
    ================================================== */
    document.addEventListener('DOMContentLoaded', function () {

        /* -----------------------------------------------
           ANNOUNCEMENT BAR DISMISS
        ----------------------------------------------- */
        var annBar   = g('announcementBar');
        var annClose = g('announcementClose');
        if (annBar && annClose) {
            annClose.addEventListener('click', function () {
                annBar.style.transition = 'max-height .3s ease, padding .3s ease, opacity .3s ease';
                annBar.style.overflow   = 'hidden';
                annBar.style.maxHeight  = annBar.offsetHeight + 'px';
                requestAnimationFrame(function () {
                    annBar.style.maxHeight = '0';
                    annBar.style.paddingTop    = '0';
                    annBar.style.paddingBottom = '0';
                    annBar.style.opacity = '0';
                });
                setTimeout(function () {
                    if (annBar.parentNode) annBar.parentNode.removeChild(annBar);
                }, 320);
            });
        }

        /* -----------------------------------------------
           MOBILE MENU
        ----------------------------------------------- */
        var hamburger   = g('hamburger');
        var mobileMenu  = g('mobileMenu');
        var closeMenu   = g('closeMenu');
        var menuOverlay = g('menuOverlay');

        function menuOpen() {
            if (mobileMenu)  mobileMenu.classList.add('active');
            if (menuOverlay) menuOverlay.classList.add('active');
            if (hamburger)   hamburger.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function menuClose() {
            if (mobileMenu)  mobileMenu.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            if (hamburger)   hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (hamburger)   hamburger.addEventListener('click', menuOpen);
        if (closeMenu)   closeMenu.addEventListener('click', menuClose);
        if (menuOverlay) menuOverlay.addEventListener('click', menuClose);
        qa('.mobile-menu-item').forEach(function (item) {
            item.addEventListener('click', menuClose);
        });

        /* -----------------------------------------------
           HERO SLIDER — pixel-based translation
           WHY PIXELS: translateX(n%) on the track means
           n% of the TRACK width (300% of container), so
           translateX(-100%) jumps 3 slides. Using px
           derived from the container's offsetWidth is
           bulletproof.
        ----------------------------------------------- */
        var sliderTrack  = g('sliderTrack');
        var sliderPrev   = g('sliderPrev');
        var sliderNext   = g('sliderNext');
        var slideDots    = qa('.dot');
        var curSlide     = 0;
        var numSlides    = sliderTrack ? sliderTrack.children.length : 0;
        var slideTimer;

        function slideWidth() {
            return sliderTrack ? sliderTrack.parentElement.offsetWidth : 0;
        }

        function goSlide(n) {
            if (!sliderTrack || numSlides === 0) return;
            curSlide = ((n % numSlides) + numSlides) % numSlides;
            sliderTrack.style.transform = 'translateX(-' + (curSlide * slideWidth()) + 'px)';
            slideDots.forEach(function (d, i) {
                d.classList.toggle('active', i === curSlide);
            });
        }

        function resetSlideTimer() {
            clearInterval(slideTimer);
            slideTimer = setInterval(function () { goSlide(curSlide + 1); }, 5000);
        }

        if (sliderTrack) {
            if (sliderPrev) sliderPrev.addEventListener('click', function () { goSlide(curSlide - 1); resetSlideTimer(); });
            if (sliderNext) sliderNext.addEventListener('click', function () { goSlide(curSlide + 1); resetSlideTimer(); });

            slideDots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    goSlide(+dot.getAttribute('data-slide'));
                    resetSlideTimer();
                });
            });

            /* Swipe support */
            var swipeX = 0;
            sliderTrack.addEventListener('touchstart', function (e) { swipeX = e.touches[0].clientX; }, { passive: true });
            sliderTrack.addEventListener('touchend',   function (e) {
                var dx = e.changedTouches[0].clientX - swipeX;
                if (Math.abs(dx) > 50) { goSlide(curSlide + (dx < 0 ? 1 : -1)); resetSlideTimer(); }
            });

            /* Resize: reposition without animation */
            window.addEventListener('resize', function () {
                sliderTrack.style.transition = 'none';
                sliderTrack.style.transform  = 'translateX(-' + (curSlide * slideWidth()) + 'px)';
                setTimeout(function () { sliderTrack.style.transition = ''; }, 60);
            }, { passive: true });

            resetSlideTimer();
        }

        /* -----------------------------------------------
           INTERACTIVE DOTS ANIMATION (HERO CANVAS)
        ----------------------------------------------- */
        var canvas = g('heroCanvas');
        if (canvas) {
            var ctx = canvas.getContext('2d');
            var heroSection = canvas.parentElement;
            var width = heroSection.offsetWidth;
            var height = heroSection.offsetHeight;
            canvas.width = width;
            canvas.height = height;
            
            var dots = [];
            var mousePos = {x: -200, y: -200}; // start off-screen
            // Using a mix of user's colors and the premium palette
            var colors = ['rgba(139,26,53,0.6)', 'rgba(184,144,42,0.6)', 'rgba(255,255,255,0.3)', 'rgba(255,170,165,0.6)', 'rgba(168,230,207,0.6)'];

            function Dot(x, y, color) {
                var _this = this;
                this.x = x;
                this.y = y;
                this.targetRadius = 3;
                this.radius = 3;
                this.color = color;
                
                this.draw = function() {
                    var dx = mousePos.x - _this.x;
                    var dy = mousePos.y - _this.y;
                    var d = Math.sqrt(dx * dx + dy * dy);
                    
                    if (d < 100) _this.targetRadius = 3 + (100-d)/7;
                    else _this.targetRadius = 3;
                    
                    _this.radius = _this.radius + (_this.targetRadius - _this.radius)*0.1;
                    ctx.beginPath();
                    ctx.arc(_this.x, _this.y, _this.radius, 0, 2 * Math.PI, false);
                    ctx.fillStyle = _this.color;
                    ctx.fill();
                }
            }

            function placeDots() {
                dots = [];
                var ci = 0;
                for (var x = 14; x < width; x = x+20) {
                    for (var y = 14; y < height; y = y+20) {
                        var d = new Dot(x, y, colors[ci % colors.length]);
                        dots.push(d);
                        ci++;
                    }
                }
            }

            function drawDots() {
                ctx.clearRect(0, 0, width, height);
                for (var i = 0; i < dots.length; i++) {
                    dots[i].draw();
                }
            }

            function resizeCanvas() {
                width = heroSection.offsetWidth;
                height = heroSection.offsetHeight;
                canvas.width = width;
                canvas.height = height;
                placeDots();
            }

            // Bind mouse/touch events to the hero section instead of canvas
            // because the canvas has pointer-events: none to allow slider clicks
            heroSection.addEventListener('mousemove', function(e) {
                var rect = heroSection.getBoundingClientRect();
                mousePos.x = e.clientX - rect.left;
                mousePos.y = e.clientY - rect.top;
            });
            heroSection.addEventListener('mouseleave', function() {
                mousePos.x = -200;
                mousePos.y = -200;
            });
            heroSection.addEventListener('touchstart', function(e) {
                var rect = heroSection.getBoundingClientRect();
                mousePos.x = e.touches[0].clientX - rect.left;
                mousePos.y = e.touches[0].clientY - rect.top;
            }, { passive: true });
            heroSection.addEventListener('touchmove', function(e) {
                var rect = heroSection.getBoundingClientRect();
                mousePos.x = e.touches[0].clientX - rect.left;
                mousePos.y = e.touches[0].clientY - rect.top;
            }, { passive: true });

            window.addEventListener('resize', resizeCanvas);

            function loopDots() {
                drawDots();
                requestAnimationFrame(loopDots);
            }

            placeDots();
            loopDots();
        }

        /* -----------------------------------------------
           FLASH SALE COUNTDOWN
        ----------------------------------------------- */
        var tH = g('timerH'), tM = g('timerM'), tS = g('timerS');
        var timerStrip = q('.flash-sale-timer');
        if (tH && tM && tS) {
            var secs = 3 * 3600 + 18 * 60 + 22;
            function pad(n) { return n < 10 ? '0' + n : String(n); }
            setInterval(function () {
                if (secs <= 0) return;
                secs--;
                tH.textContent = pad(Math.floor(secs / 3600));
                tM.textContent = pad(Math.floor((secs % 3600) / 60));
                tS.textContent = pad(secs % 60);
                /* Mark urgent (blink animation) when under 1 hour */
                if (timerStrip) timerStrip.classList.toggle('urgent', secs < 3600);
            }, 1000);
        }

        /* -----------------------------------------------
           ADD TO BAG
        ----------------------------------------------- */
        var cartCount = 0;
        var cartEl    = g('cartCount');
        var cartIcon  = q('.cart-action');

        qa('.add-button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                cartCount++;
                if (cartEl) cartEl.textContent = cartCount;
                if (cartIcon) {
                    cartIcon.classList.remove('cart-bounce');
                    void cartIcon.offsetWidth; /* force reflow */
                    cartIcon.classList.add('cart-bounce');
                    setTimeout(function () { cartIcon.classList.remove('cart-bounce'); }, 450);
                }
                toast('"' + (btn.getAttribute('data-product') || 'Item') + '" added to Bag!', '🛍️');
            });
        });

        /* -----------------------------------------------
           WISHLIST TOGGLE
        ----------------------------------------------- */
        var wishCount = 0;
        var wishEl    = g('wishlistCount');

        qa('.wishlist-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var on = btn.classList.toggle('active');
                btn.style.color = on ? '#8B1A35' : '#ccc';
                btn.classList.remove('heart-pop');
                void btn.offsetWidth;
                btn.classList.add('heart-pop');
                setTimeout(function () { btn.classList.remove('heart-pop'); }, 400);
                wishCount = on ? wishCount + 1 : Math.max(0, wishCount - 1);
                if (wishEl) wishEl.textContent = wishCount;
                toast(on ? 'Added to Wishlist!' : 'Removed from Wishlist', on ? '❤️' : '💔');
            });
        });

        /* -----------------------------------------------
           SEARCH
        ----------------------------------------------- */
        var searchInput = g('searchInput');
        var searchBtn   = g('searchBtn');

        function doSearch() {
            var q = searchInput ? searchInput.value.trim() : '';
            toast(q ? 'Searching for "' + q + '"…' : 'Please enter a search term', q ? '🔍' : '⚠️');
        }

        if (searchBtn)   searchBtn.addEventListener('click', doSearch);
        if (searchInput) {
            searchInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') doSearch(); });
            /* Show/hide suggestion box */
            searchInput.addEventListener('focus',  function () { var s = q('.search-suggestions'); if (s) s.style.display = 'block'; });
            searchInput.addEventListener('blur',   function () {
                setTimeout(function () { var s = q('.search-suggestions'); if (s) s.style.display = 'none'; }, 200);
            });
        }

        /* -----------------------------------------------
           NEWSLETTER FORM
        ----------------------------------------------- */
        var nlForm = g('newsletterForm');
        if (nlForm) {
            nlForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var eml = g('newsletterEmail');
                var val = eml ? eml.value.trim() : '';
                if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    toast('Subscribed! 10% off code sent to ' + val, '🎁');
                    if (eml) eml.value = '';
                } else {
                    /* Open Props shake-x animation on invalid submit */
                    nlForm.classList.remove('shake');
                    void nlForm.offsetWidth;
                    nlForm.classList.add('shake');
                    setTimeout(function () { nlForm.classList.remove('shake'); }, 700);
                    toast('Please enter a valid email address', '⚠️');
                }
            });
        }

        /* -----------------------------------------------
           PROFILE DROPDOWN (click toggle)
        ----------------------------------------------- */
        var profTrigger = g('profileDropdownTrigger');
        var profDrop    = g('profileDropdown');
        if (profTrigger && profDrop) {
            profTrigger.addEventListener('click', function (e) {
                e.stopPropagation();
                var open = profDrop.style.opacity === '1';
                profDrop.style.opacity      = open ? '0' : '1';
                profDrop.style.pointerEvents = open ? 'none' : 'all';
                profDrop.style.transform    = open ? 'translateY(12px)' : 'translateY(0)';
            });
            document.addEventListener('click', function () {
                profDrop.style.opacity      = '0';
                profDrop.style.pointerEvents = 'none';
                profDrop.style.transform    = 'translateY(12px)';
            });
        }

        /* -----------------------------------------------
           STICKY HEADER SHADOW + BACK-TO-TOP
        ----------------------------------------------- */
        var header  = g('mainHeader');
        var backTop = g('backToTop');

        window.addEventListener('scroll', function () {
            var y = window.pageYOffset || document.documentElement.scrollTop;
            if (header)  header.style.boxShadow = y > 60 ? '0 4px 20px rgba(0,0,0,.15)' : '0 1px 6px rgba(0,0,0,.06)';
            if (backTop) backTop.classList.toggle('visible', y > 400);
        }, { passive: true });

        if (backTop) backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

        /* -----------------------------------------------
           SCROLL REVEAL — fade/lift on scroll
        ----------------------------------------------- */
        var revEls = qa(
            '.product-card,.lookbook-card,.review-card,.beauty-card,' +
            '.brand-card,.promo-card,.arrival-banner,.trust-item,.cat-icon-item'
        );
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        en.target.style.opacity   = '1';
                        en.target.style.transform = 'translateY(0)';
                        io.unobserve(en.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

            revEls.forEach(function (el) {
                el.style.opacity    = '0';
                el.style.transform  = 'translateY(22px)';
                el.style.transition = 'opacity .5s ease, transform .5s ease';
                io.observe(el);
            });
        }

        /* -----------------------------------------------
           QUICK VIEW — placeholder toast
        ----------------------------------------------- */
        qa('.quick-view').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var card = btn.closest ? btn.closest('.product-card') : null;
                var name = card ? (card.getAttribute('data-product') || 'Product') : 'Product';
                toast('Quick View: ' + name, '👁️');
            });
        });

        /* -----------------------------------------------
           SMOOTH BACKGROUND SCENE LOGIC
        ----------------------------------------------- */
        var smoothBgWidth = window.innerWidth;
        var smoothBgNum = 0;
        
        function updateSmoothBg(item) {
            if (!item) return;
            var N = 640;
            var step = Math.ceil(smoothBgWidth / N);
            var html = '<div class="area"><div class="field"></div><div class="load"><div class="line"></div></div><div class="tree tree01"></div><div class="tree tree02"><div class="leaf"></div></div><div class="tree tree03"><div class="leaf"></div></div><div class="tree tree02 pos02"><div class="leaf"></div></div><div class="tree tree03 pos02"><div class="leaf"></div></div><div class="hydrant pos01"><div class="line"></div></div><div class="hydrant pos02"><div class="line"></div></div><div class="back_building building01"></div><div class="back_building building02"></div><div class="back_building building03"></div><div class="back_building building04"></div><div class="sign"><div class="panel pos01"></div><div class="panel pos02"></div><div class="panel pos03"></div></div><div class="traffic_light"><div class="circle red"></div><div class="circle yellow"></div><div class="circle green"></div></div><div class="street_lamp street_lamp01"><div class="light left"></div><div class="light right"></div></div><div class="street_lamp street_lamp02"><div class="light"></div></div><div class="cloud cloud01"><div class="circle circle01"></div><div class="circle circle02"></div></div><div class="cloud cloud02"><div class="circle circle01"></div><div class="circle circle02"></div><div class="circle circle03"></div></div><div class="cloud cloud03"><div class="circle circle01"></div></div><div class="tower tower01"><div class="chimney chimney01"></div><div class="window window01" data-h="0" data-pos="0"></div><div class="window window01" data-h="1" data-pos="1"></div><div class="window window01" data-h="2" data-pos="2"></div><div class="window window01" data-h="0" data-pos="3"></div><div class="window window01" data-h="3" data-pos="4"></div><div class="window window01" data-h="4" data-pos="5"></div><div class="window window01" data-h="0" data-pos="6"></div><div class="window window01" data-h="0" data-pos="7"></div><div class="door door01"></div><div class="stair"><div class="side pos01"><div class="deck"></div></div><div class="side pos02"><div class="deck"></div></div></div></div><div class="tower tower02"><div class="chimney chimney02"></div><div class="window window01" data-h="1" data-pos="0"></div><div class="window window01" data-h="2" data-pos="1"></div><div class="window window01" data-h="0" data-pos="2"></div><div class="window window01" data-h="3" data-pos="3"></div><div class="window window01" data-h="4" data-pos="4"></div><div class="window window01" data-h="0" data-pos="5"></div><div class="window window01" data-h="2" data-pos="6"></div><div class="window window01" data-h="0" data-pos="7"></div><div class="door door02"><div class="deck"></div></div></div><div class="tower tower03"><div class="floor"><div class="chimney chimney01"></div><div class="window window02" data-h="0" data-pos="0"></div><div class="window window02" data-h="1" data-pos="1"></div></div><div class="window window03"><div class="deck"></div></div><div class="door door03"><div class="deck"></div></div></div><div class="tower tower04"><div class="billboard"><div class="deck"></div></div><div class="kiosk"><div class="deck01"></div><div class="deck02"></div><div class="deck03"></div><div class="deck04"></div></div><div class="door door01"></div></div><div class="tower tower05"><div class="chimney chimney01"></div><div class="window window01" data-h="5" data-pos="0"></div><div class="window window01" data-h="0" data-pos="1"></div><div class="window window01" data-h="6" data-pos="2"></div><div class="window window04" data-s="0" data-pos="3"></div><div class="window window04" data-s="1" data-pos="4"></div><div class="kiosk"><div class="deck01"></div><div class="deck02"></div><div class="deck03"></div><div class="deck04"></div></div><div class="door door01"></div></div><div class="balloon balloon01"><div class="deck"></div></div><div class="balloon balloon02"><div class="deck"></div></div></div>';
            
            if (step !== smoothBgNum) {
                smoothBgNum = step;
                item.innerHTML = '';
                item.style.width = (N * step) + 'px';
                for (var i = 0; i < step; i += 1) {
                    item.insertAdjacentHTML('beforeend', html);
                }
            }
        }
        
        var smoothBgItem = document.querySelector('.bg_area .bg01');
        if (smoothBgItem) {
            updateSmoothBg(smoothBgItem);
            var resizeTimerSmooth;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimerSmooth);
                resizeTimerSmooth = setTimeout(function() {
                    smoothBgWidth = window.innerWidth;
                    updateSmoothBg(smoothBgItem);
                }, 250);
            });
        }

    }); /* end DOMContentLoaded */

})(); /* end IIFE */
