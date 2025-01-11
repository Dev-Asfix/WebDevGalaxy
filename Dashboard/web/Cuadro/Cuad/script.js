const $context = document.querySelector("body");
const $circle = document.querySelector("#circle");
const $images = document.querySelectorAll(".gallery img");
const gallery = document.querySelector(".gallery");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let onImg = false;
let hoveringImg = null;
const easing = 0.1;

$context.addEventListener("pointermove", (evt) => {
    if (!onImg) {
        targetX = evt.clientX - $circle.getBoundingClientRect().width / 2;
        targetY = evt.clientY - $circle.getBoundingClientRect().height / 2;
    }
});

function animateCircle() {
    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;

    $circle.style.setProperty("--xpos", `${currentX}px`);
    $circle.style.setProperty("--ypos", `${currentY}px`);

    requestAnimationFrame(animateCircle);
}

animateCircle();

$images.forEach((img) => {
    img.addEventListener("mouseenter", () => {
        const galleryWidth = gallery.getBoundingClientRect().width;
        const scaleFactor = galleryWidth < 750 ? 2 : 1.3;

        const imgRect = img.getBoundingClientRect();
        const finalWidth = imgRect.width * scaleFactor + 20;
        const finalHeight = imgRect.height * scaleFactor + 20;
        const translateY = -0.2 * imgRect.height;
        const imgCenterX = imgRect.left + window.scrollX + imgRect.width / 2;
        const imgCenterY =
            imgRect.top + window.scrollY + imgRect.height / 2 + translateY;

        targetX = imgCenterX - finalWidth / 2;
        targetY = imgCenterY - finalHeight / 2;

        if (!onImg || hoveringImg !== img) {
            $circle.style.width = `${finalWidth}px`;
            $circle.style.height = `${finalHeight}px`;
            $circle.style.borderRadius = "22px";
        }

        onImg = true;
        hoveringImg = img;
        console.log(onImg);
    });
    img.addEventListener("mouseleave", (evt) => {
        if (hoveringImg === img) {
            onImg = false;
            hoveringImg = null;
            console.log(onImg);

            $circle.style.width = "var(--circleSize)";
            $circle.style.height = "var(--circleSize)";
            $circle.style.borderRadius = "50%";

            targetX = evt.clientX - $circle.getBoundingClientRect().width / 2;
            targetY = evt.clientY - $circle.getBoundingClientRect().height / 2;
        }
    });
});
