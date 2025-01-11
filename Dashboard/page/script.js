const progressCircle = document.querySelectorAll(".autoplay-progress");
const progressBar = document.querySelectorAll(".autoplay-progress-bar");

const swiper = new Swiper(".swiper", {
    lazy: true,
    slidesPerView: 1,
    spaceBetween: 0,
    grabCursor: true,
    effect: "coverflow",
    speed: 1500,
    coverflowEffect: {
        rotate: 100,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
    },
    mousewheel: true,
    keyboard: {
        enabled: true,
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
    pagination: {
        el: ".swiper-pagination",
        dynamicBullets: false,
        clickable: true,
    },
    navigation: {
        nextEl: ".slider-button-next",
        prevEl: ".slider-button-prev",
    },
    on: {
        autoplayTimeLeft(s, time, progress) {
            progressCircle.forEach((progressCircle) => {
                progressCircle
                    .querySelector("svg")
                    .style.setProperty("--progress", 1 - progress);
                progressCircle.querySelector("span").textContent = `${Math.ceil(
                    time / 1000
                )}s`;
            });
            progressBar.forEach((progressBar) => {
                progressBar.style.setProperty("--progress", `${(1 - progress) * 100}%`);
            });
        },
        init() {
            changeBackground(this);
        },
        slideChange() {
            changeBackground(this);
        },
    },
});

function changeBackground(slide) {
    const getBackground =
        slide.slides[slide.activeIndex].getAttribute("data-bg-color");

    const getProgressColor = slide.slides[slide.activeIndex].getAttribute(
        "data-progress-color"
    );

    document.body.style.backgroundColor = `${getBackground}`;

    document.body.style.setProperty("--progress-color", `${getProgressColor}`);
    document.body.style.setProperty("--theme-color", `${getBackground}`);
}