/**
 *
 * -----------------------------------------------------------------------------
 *
 * Template : BioHub Personal Portfolio HTML Template
 * Author : InversWeb
 * Author URI : https://themeforest.net/user/inversweb/ 
 *
 * -----------------------------------------------------------------------------
 *
 **/

/*=== Javascript function indexing hear===========

1.clapAnimation ----------(Its use for mouseenter)
2.titleAnim -------(tilt animation)
3.gridMask ----------( gridMask)
4.swiperJs -----------(All swiper in this website hear)
5.salActive ----------(Sal animation for card and all text)
6.lightBoxJs --------(lightBoxJs for lightBoxJs)
7.timeLine -----------(History Time line)
8.tmpMouseMoveAnimation ---------(On click tmpMouseMoveAnimation)
9.timePicker ---------(On click time picker)
10.timeLineStory -----(History page time line)
11.vedioActivation----(Vedio activation)
12.searchOption ------(search open)
13.cartBarshow -------(Cart sode bar)
14.sideMenu ----------(Open side menu for desktop)
15.Back to top -------(back to top)
16.animationOnHover -------(animationOnHover)

==================================================*/


(function ($) {
  "use strict";
  var invJs = {
    m: function (e) {
      invJs.d();
      invJs.methods();
    },

    d: function (e) {
      (this._window = $(window)),
        (this._document = $(document)),
        (this._body = $("body")),
        (this._html = $("html"));
    },

    methods: function (e) {
      invJs.preloaderActive();
      invJs.textFooter();
      invJs.imageAnimation();
      invJs.clapAnimation();
      invJs.titleAnim();
      invJs.gridMask();
      invJs.smothScroll();
      invJs.lightBoxJs();
      invJs.swiperWidget();
      invJs.WOW();
      invJs.counterUp();
      invJs.typedActive();
      invJs.menuCurrentLink();
      invJs.stickyHeader();
      invJs.popupMobileMenu();
      invJs.onePageNav();
      invJs.rightDemo();
      invJs.tmpMouseMoveAnimation();
      invJs.tmpcustomAnimation();
      invJs.uiUxSwiper();
      invJs.positionStickyJs();
      invJs.dateUpdate();
      invJs.stickyElements();
      invJs.videoActivation();
      invJs.animationOnHover();
    },


    preloaderActive: function(){
        // ================================
        // 1. Text Split Function
        // ================================
        function splitTextToSpans(element) {
          if (!element) return;

          const text = element.textContent.trim();
          element.innerHTML = "";

          [...text].forEach(char => {
            const span = document.createElement("span");
            span.innerHTML = char === " " ? "&nbsp;" : char;
            element.appendChild(span);
          });
        }

        // ================================
        // 2. Preloader Function
        // ================================
        function handlePreloader() {
          const $preloader = $(".inversweb-preloader");

          if (!$preloader.length) return;

          setTimeout(() => {
            $preloader.removeClass("is-loading").addClass("is-loaded");

            setTimeout(() => {
              $preloader.fadeOut(100);
            }, 350);

          }, 1000);
        }

        // ================================
        // 3. Init on Load
        // ================================
        $(window).on("load", function () {
          const target = document.getElementById("inversweb-weave-anim");

          splitTextToSpans(target);
          handlePreloader();
        });

    },

    textFooter: function(){
      const headings = document.querySelectorAll('.text-scale-anim');

      headings.forEach(heading => {
        const textNodes = [];

        heading.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent.split(' ').forEach((word, index, array) => {
              const wordSpan = document.createElement('span');
              wordSpan.classList.add('invers-word-span');

              word.split('').forEach(letter => {
                const letterSpan = document.createElement('span');
                letterSpan.classList.add('invers-letter-span');
                letterSpan.textContent = letter;
                wordSpan.appendChild(letterSpan);
              });

              textNodes.push(wordSpan);

              if (index < array.length - 1) {
                textNodes.push(document.createTextNode(' '));
              }
            });
          } else {
            textNodes.push(node.cloneNode(true));
          }
        });

        heading.innerHTML = '';
        textNodes.forEach(node => heading.appendChild(node));

        const letters = heading.querySelectorAll('.invers-letter-span');

        letters.forEach((letter, index) => {

          const prev = letters[index - 1];
          const next = letters[index + 1];

          letter.addEventListener('mouseenter', () => {
            gsap.to(letter, {
              scaleY: 1.6,
              y: '-24%',
              color: 'var(--color-primary)',
              duration: 0.4,
              ease: 'power2.out',
              overwrite: true
            });

            if (prev) {
              gsap.to(prev, {
                scaleY: 1.3,
                y: '-12%',
                color: 'var(--color-primary)',
                duration: 0.4,
                ease: 'power2.out',
                overwrite: true
              });
            }

            if (next) {
              gsap.to(next, {
                scaleY: 1.3,
                y: '-12%',
                color: 'var(--color-primary)',
                duration: 0.4,
                ease: 'power2.out',
                overwrite: true
              });
            }
          });

          letter.addEventListener('mouseleave', () => {
            gsap.to([letter, prev, next], {
              scaleY: 1,
              y: '0%',
              color: '',
              duration: 0.4,
              ease: 'power2.out',
              overwrite: true
            });
          });

        });
      });
    },

    imageAnimation: function(){
      // 17. webgl images hover animation
      if ($('.inv-hover-item').length) {
        let hoverAnimation__do = function (t, n) {
          let a = new hoverEffect({
            parent: t.get(0),
            intensity: t.data("intensity") || void 0,
            speedIn: t.data("speedin") || void 0,
            speedOut: t.data("speedout") || void 0,
            easing: t.data("easing") || void 0,
            hover: t.data("hover") || void 0,
            image1: n.eq(0).attr("src"),
            image2: n.eq(0).attr("src"),
            displacementImage: t.data("displacement"),
            imagesRatio: n[0].height / n[0].width,
            hover: !1
          });
          t.closest(".inv-hover-item").on("mouseenter", function () {
            a.next()
          }).on("mouseleave", function () {
            a.previous()
          })
        }
        let hoverAnimation = function () {
          $(".inv-hover-img").each(function () {
            let n = $(this);
            let e = n.find("img");
            let i = e.eq(0);
            i[0].complete ? hoverAnimation__do(n, e) : i.on("load", function () {
              hoverAnimation__do(n, e)
            })
          })
        }
        hoverAnimation();
      }

    },

    animationOnHover: function () {
      let cards = document.querySelectorAll('.invonhover');
        cards.forEach((tmpOnHover) => {
          tmpOnHover.onmousemove = function (e) {
            let rect = tmpOnHover.getBoundingClientRect();
            let x = e.clientX - rect.left; // element X position
            let y = e.clientY - rect.top;  // element Y position
            tmpOnHover.style.setProperty('--x', `${x}px`);
            tmpOnHover.style.setProperty('--y', `${y}px`);
          };
      });
    },

    clapAnimation: function () {
      $(document).on("mouseenter", ".like-button", function () {
        var $btn = $(this);
        $btn.addClass("animate");
        setTimeout(function() {
          $btn.removeClass("animate");
        }, 300);
      });
    },

    videoActivation: function () {
      $('.popup-youtube, .popup-video').magnificPopup({
        type: 'iframe',
      });
    },

    titleAnim: function(){
      	const target = document.getElementById("inversanim");
        function splitTextToSpans(targetElement) {
          if (targetElement) {
            const text = targetElement.textContent;
            targetElement.innerHTML = "";
            for (let character of text) {
              const span = document.createElement("span");
              if (character === " ") {
                span.innerHTML = "&nbsp;";
              } else {
                span.textContent = character;
              }
              targetElement.appendChild(span);
            }
          }
        }
        splitTextToSpans(target);
    },



    gridMask: function(){
        // portfolio-slide-3
        if (document.querySelectorAll(".slider-gird").length > 0) {
          document.querySelectorAll('.grid-mask').forEach(gridMask => {
            let blocks = [];
            for (let i = 0; i < 32; i++) {
              let block = document.createElement("div");
              block.style.transitionDelay = `${Math.random() * 1.5}s`;
              blocks.push(block);
            }
            blocks.sort(() => Math.random() - 0.5);
            blocks.forEach(block => gridMask.appendChild(block));
          });

        }
    },


    smothScroll: function () {
      $(document).on("click", ".smoth-animation, .scroll-down-section", function (event) {
        event.preventDefault();

        var target = $($.attr(this, "href"));

        if (target.length) {
          $("html, body").animate(
            {
              scrollTop: target.offset().top - 80,
            },
            300
          );
        }
      });
    },


    lightBoxJs: function () {
        lightGallery(document.getElementById('animated-lightbox'), {
            thumbnail: true,
            animateThumb: false,
            showThumbByDefault: false,
            cssEasing: 'linear'
        });

        lightGallery(document.getElementById('animated-lightbox2'), {
            thumbnail: true,
            animateThumb: false,
            showThumbByDefault: false,
            cssEasing: 'linear'
        });

        lightGallery(document.getElementById('animated-lightbox3'), {
            thumbnail: true,
            animateThumb: false,
            showThumbByDefault: false,
            cssEasing: 'linear'
        });
    },
    


    swiperWidget: function () {
      // testimonial slider
      new Swiper(".modern-testimonial-activation", {
        slidesPerView: 2,
        spaceBetween: 30,
        loop: true,
        speed: 1000,
        grabCursor: true,
        navigation: {
          nextEl: ".tmp-next",
          prevEl: ".tmp-prev",
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 1.9,
          },
          992: {
            slidesPerView: 2,
          },
          1200: {
            slidesPerView: 1,
          },
          1400: {
            slidesPerView: 2,
          },
          1600: {
            slidesPerView: 2,
          },
        },
      });

      // MAIN CARDS SERVICE SLIDER
      new Swiper(".tmp-service-slider", {
        loop: true,
        freemode: true,
        slidesPerView: 'auto',
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
        allowTouchMove: false,
        speed: 2500,
        autoplay: {
          delay: 0,
          disableOnInteraction: true,
        },
        breakpoints: {
          0: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          480: {
            centeredSlides: true,
            slidesPerView: 2,
            spaceBetween: 10,
          },
          576: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 3,
          },
          992: {
            slidesPerView: 4,
          },
          1200: {
            slidesPerView: 5,
          },
          1400: {
            slidesPerView: 6,
          },
          1600: {
            slidesPerView: 7,
          },
        },
      });

      // MAIN TESTIMONIAL SLIDER
      new Swiper(".tmp-client-slider", {
        slidesPerView: 1,
        loop: true,
        speed: 1500,
        grabCursor: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        autoplay: {
          delay: 2500,
          disableOnInteraction: true,
        },
      });

      // MODEL TESTIMONIAL
      new Swiper(".model-review-slider", {
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        speed: 2000,
          autoplay: {
          delay: 2500,
          disableOnInteraction: true,
        },
        // grabCursor: true,
        // centeredSlides: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
          },
          576: {
            slidesPerView: 1,
          },
          767: {
            slidesPerView: 2,
          },
          992: {
            slidesPerView: 2,
          },
          1200: {
            slidesPerView: 2,
          },
          1400: {
            slidesPerView: 2,
          },
          1600: {
            slidesPerView: 3,
          },
        },
      });

      // FREELANCER TESTIMONIAL
      new Swiper(".marque-slider", {
        slidesPerView: 7.5,
        spaceBetween: 30,
        loop: true,
        speed: 1000,
        autoplay: {
          delay: 3000,
        },
        grabCursor: true,
        breakpoints: {
          0: {
            slidesPerView: 2,
          },
          576: {
            slidesPerView: 2.4,
          },
          768: {
            slidesPerView: 4,
          },
          992: {
            slidesPerView: 4.5,
          },
          1200: {
            slidesPerView: 5.5,
          },
          1400: {
            slidesPerView: 6,
          },
          1600: {
            slidesPerView: 7.5,
          },
        },
      });

      // PHOTOGRAPHY SLIDER
      new Swiper(".tmp-slider-wrapper", {
        slidesPerView: 4,
        spaceBetween: 30,
        loop: true,
        speed: 1000,
        grabCursor: true,
        autoplay: {
          delay: 3000,
        },
        navigation: {
          nextEl: ".tmp-next",
          prevEl: ".tmp-prev",
        },
        breakpoints: {
          0: {
            slidesPerView: 1.5,
          },
          576: {
            slidesPerView: 2.4,
          },
          768: {
            slidesPerView: 3,
          },
          992: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 4,
          },
          1400: {
            slidesPerView: 4,
          },
          1600: {
            slidesPerView: 4,
          },
        },
      });

      // Initialize the main slider (model-hero-top)
      var mainSlider = new Swiper(".model-hero-top", {
        slidesPerView: 1,
        loop: true,
        speed: 1000,
        grabCursor: true,
        effect: "fade",
        autoplay: false,
      });

      // Initialize the thumbnail slider (model-hero-slider)
      var thumbSlider = new Swiper(".model-hero-slider-activation", {
        slidesPerView: 1,
        loop: true,
        speed: 1000,
        grabCursor: true,
        autoplay: false,
        // autoplay: {
        //   delay: 3000,
        // },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });

      // Synchronize the two sliders
      mainSlider.controller.control = thumbSlider;
      thumbSlider.controller.control = mainSlider;
    },

    uiUxSwiper: function () {
      // Ui Ux Banner Activation
      var uxContent = new Swiper(".hero-content-activation", {
        slidesPerView: 1,
        loop: true,
        speed: 1500,
        grabCursor: true,
        effect: "slide",
      });

      // Initialize the thumbnail slider (model__hero__slider)
      var uxThumbSlider = new Swiper(".banner-image-activation", {
        slidesPerView: 1,
        loop: true,
        speed: 1500,
        grabCursor: true,
        effect: "fade",
        // autoplay: {
        //   delay: 3000,
        // },
        navigation: {
          nextEl: ".tmp-next",
          prevEl: ".tmp-prev",
        },
      });

      uxContent.controller.control = uxThumbSlider;
      uxThumbSlider.controller.control = uxContent;
    },

    WOW: function () {
      new WOW().init();
    },

    counterUp: function () {
      $(document).ready(function () {
        if ($('.counter').length) {
          $('.counter').counterUp({
            delay: 10,
            time: 1000
          });
        }
      });
    },

    typedActive: function () {
      try {
        var typed = new Typed(".typed", {
          strings: ["Photographer", "Designer", "Freelancer"],
          typeSpeed: 150,
          loop: true,
        });
      } catch (error) {}
    },

    menuCurrentLink: function () {
      var currentPage = location.pathname.split("/"),
        current = currentPage[currentPage.length - 1];
      $(".tmp-mainmenu li a").each(function () {
        var $this = $(this);
        if ($this.attr("href") === current) {
          $this.addClass("active");
          $this.parents(".has-dropdown").addClass("menu-item-open");
        }
      });
    },

    // sticky header activation
    stickyHeader: function (e) {
    let ticking = false;
    $(window).on('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          if ($(window).scrollTop() > 150) {
            $('.header--sticky').addClass('sticky')
          } else {
            $('.header--sticky').removeClass('sticky')
          }
          ticking = false;
        });
        ticking = true;
      }
    });
    },

    popupMobileMenu: function (e) {
        var $html = $("html");
        var $body = $("body");
        
        // Event delegation for dynamic elements
        $(document)
            // Open menu (delegation)
            .on("click", ".humberger_menu_active", function(e) {
                e.stopPropagation();
                $(".tmp-popup-mobile-menu").addClass("active");
                $html.css("overflow", "hidden");
            })
            
            // Close menu
            .on("click", ".close-menu", function(e) {
                e.stopPropagation();
                closeMobileMenu();
            })
            
            // Handle dropdown toggle with delegation
            .on("click", ".tmp-popup-mobile-menu .tmp-mainmenu .has-dropdown > a", function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $this = $(this);
                var $submenu = $this.siblings(".submenu");
                
                // Close other open dropdowns
                $(".tmp-popup-mobile-menu .tmp-mainmenu .has-dropdown > a").not($this).each(function() {
                    var $otherSubmenu = $(this).siblings(".submenu");
                    if ($otherSubmenu.hasClass("active")) {
                        $otherSubmenu.removeClass("active").slideUp("400");
                        $(this).removeClass("open");
                    }
                });
                
                // Toggle current
                $submenu.toggleClass("active").slideToggle("400");
                $this.toggleClass("open");
            })
            
            // Close on overlay click (delegation)
            .on("click", ".tmp-popup-mobile-menu", function(e) {
            if (e.target === this) {
                    closeMobileMenu();
                }
            })
            
            // Close on nav link click
            .on("click", ".tmp-popup-mobile-menu .tmp-mainmenu.onepagenav li a", function(e) {
                closeMobileMenu();
            })
            
            // Close on onepagenav click
            .on("click", ".onepagenav-click a", function(e) {
                closeMobileMenu();
            });
        
        // Helper function
        function closeMobileMenu() {
            $(".tmp-popup-mobile-menu").removeClass("active");
            $(".tmp-popup-mobile-menu .tmp-mainmenu .has-dropdown > a")
                .siblings(".submenu")
                .removeClass("active")
                .slideUp("400");
            $(".tmp-popup-mobile-menu .tmp-mainmenu .has-dropdown > a")
                .removeClass("open");
            $html.css("overflow", "");
        }
        
        // Window resize handling
        $(window).on("resize", function() {
            if ($(window).width() > 991 && $(".tmp-popup-mobile-menu").hasClass("active")) {
                closeMobileMenu();
            }
        });
        
        // ESC key support
        $(document).on("keyup", function(e) {
            if (e.key === "Escape" && $(".tmp-popup-mobile-menu").hasClass("active")) {
                closeMobileMenu();
            }
        });
    },

    onePageNav: function () {
      if ($.fn.onePageNav) {
        $(".onepagenav").onePageNav({
          currentClass: "current",
          changeHash: false,
          scrollSpeed: 700,
          scrollThreshold: 0.4,
          filter: ":not(.external)",
          easing: "swing",
        });
      }
    },

    rightDemo: function (e) {
      $(document).on("click", ".show-demo", function (e) {
        $(".demo-modal-area").addClass("open");
      });
      
      $(document).on("click", ".demo-close-btn", function (e) {
        $(".demo-modal-area").removeClass("open");
      });
      
      $(document).on("click", ".popuptab-area li a", function (e) {
        e.preventDefault();
        var $modal = $(".demo-modal-area");
        $modal.removeClass("dark-version active-light active-pink");
        
        if ($(this).hasClass("demo-dark")) {
          $modal.addClass("dark-version");
        } else if ($(this).hasClass("demo-light")) {
          $modal.addClass("active-light");
        } else if ($(this).hasClass("demo-pink")) {
          $modal.addClass("active-pink");
        }
      });
    },

    tmpMouseMoveAnimation: function () {
      function updateBackground($activeItem, $backgroundHighlight) {
        if (!$activeItem || !$activeItem.length) return; // Exit if the element doesn't exist

        const itemOffset = $activeItem.offset();
        const menuOffset = $activeItem
          .closest(".tmp-on-hover-animation")
          .offset();

        $backgroundHighlight.css({
          width: $activeItem.outerWidth(),
          height: $activeItem.outerHeight(),
          left: itemOffset.left - menuOffset.left,
          top: itemOffset.top - menuOffset.top,
        });
      }

      function initializeNavEffectActivation(container) {
        const $menuItems = $(container).find(
          "ul li a, .rbt-tab-btn-list button"
        );
        const $backgroundHighlight = $(container).find(".tmp-bg-highlight");

        // Initialize the background position on page load
        updateBackground(
          $(container).find("a.active, button.active"),
          $backgroundHighlight
        );

        // Add event listeners to each menu item
        $menuItems.each(function () {
          $(this).on("mouseenter", function () {
            updateBackground($(this), $backgroundHighlight);

            // Add hover effect and keep track of the active item
            $menuItems.removeClass("hovered");
            $(this).addClass("hovered");
          });

          $(this).on("mouseleave", function () {
            $(this).removeClass("hovered");
            updateBackground(
              $(container).find("a.active, button.active"),
              $backgroundHighlight
            );
          });

          $(this).on("click", function (e) {
            e.preventDefault();

            // Remove active class from all items and set the clicked one as active
            $menuItems.removeClass("active");
            $(this).addClass("active");

            // Update background position based on the new active item
            updateBackground($(this), $backgroundHighlight);
          });
        });

        // Optional: Reset the background to the active item when the mouse leaves the menu
        $(container).on("mouseleave", function () {
          $menuItems.removeClass("hovered");
          updateBackground(
            $(container).find("a.active, button.active"),
            $backgroundHighlight
          );
        });
      }

      // Initialize nav effect activation for each container
      $(".tmp-on-hover-animation").each(function () {
        initializeNavEffectActivation(this);
      });
    },

    tmpcustomAnimation: function () {
      return {
        init: function () {
          this.animates();
        },
        animates: function () {
          var animates = $(".tmp-scroll-trigger");
          if (animates.length > 0) {
            animates.each(function () {
              $(this).on("animationend", function (e) {
                setTimeout(function () {
                  $(e.target).attr("animation-end", "");
                }, 1000);
              });
            });
          }
        },
      };
    },

    
    positionStickyJs: function () {

      let mediaMatch = gsap.matchMedia();

        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Optional RTL helper
        function rtlValue(value) {
          return value; // LTR এর জন্য as-is
        }
        // Arrange on Scroll Animation
        function initArrangeAnim() {
          const panelsContainers = document.querySelectorAll(
            ".invers-arrange-container"
          );
          if (panelsContainers?.length) {
            mediaMatch.add("(min-width: 992px)", () => {
              panelsContainers.forEach((panelsContainer, idx) => {
                const panels = panelsContainer.querySelectorAll(".invers-arrange-item");

                const startOffset = 50;
                panels.forEach((panel, i) => {
                  gsap.from(panel, {
                    xPercent: i % 2 === 0 ? rtlValue(-15) : rtlValue(15),
                    ease: "none",
                    scrollTrigger: {
                      trigger: panel,
                      start: `top bottom`,
                      end: `bottom bottom`,
                      pin: false,
                      pinSpacing: false,
                      scrub: true,
                      markers: false,
                      invalidateOnRefresh: true,
                    },
                  });
                });
              });
            });
          }
        }
        initArrangeAnim();

        // Service stack animation
        const serviceStack = gsap.utils.toArray(".service-stack");
        if (serviceStack.length > 0) {
          mediaMatch.add("(min-width: 992px)", () => {
            serviceStack.forEach(item => {
              gsap.to(item, {
                opacity: 0,
                scale: 0.9,
                y: 50,
                scrollTrigger: {
                  trigger: item,
                  scrub: true,
                  start: "top top",
                  pin: true,
                  pinSpacing: false,
                  markers: false,
                },
              });
            });
          });
        }

    },

    dateUpdate: function () {
      let yearElement = document.getElementById("year");
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
    },

    stickyElements: function(){
      let mediaMatch = gsap.matchMedia();

      function initStickyPanel3Animation() {
        const container = document.querySelector(".inversweb-sticky-panel-1-container");
        const panels = document.querySelectorAll(".inversweb-sticky-panel-1");
        if (!container || panels.length === 0) return;
        mediaMatch.add("(min-width: 992px)", () => {
          const startOffset =
            parseInt(getComputedStyle(container).paddingTop, 10) || 120;  // ← radix 10
          const lastIdx = panels.length - 1;
          const lastPanel = panels[lastIdx];
          const paddingBottom =
            parseInt(getComputedStyle(container).paddingBottom, 10) || 0;  // ← radix 10
          panels.forEach((panel, i) => {
            gsap.to(panel, {
              scrollTrigger: {
                trigger: panel,
                start: `top-=${startOffset} top`,
                endTrigger: container,
                end: () =>
                  `bottom top+=${
                    lastPanel.offsetHeight + startOffset + paddingBottom
                  }`,
                pin: true,
                pinSpacing: false,
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
              ease: "circ",
              opacity: i === 0 || i === lastIdx ? 1 : 0.1,
            });
          });
        });
      }
      initStickyPanel3Animation();
    }


  };

  invJs.m();
})(jQuery, window);
