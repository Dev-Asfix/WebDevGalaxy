document.addEventListener("DOMContentLoaded", () => {
    // === DOM Elements ===
    const backgroundLayer = document.querySelector(".background-layer");
    const slideshow = document.querySelector(".slideshow");
    const slides = document.querySelectorAll(".slide");
    const ambientLightLayer = document.querySelector(".ambient-light-layer");
    const foregroundLayer = document.querySelector(".foreground-layer");
    const translateZSlider = document.getElementById("translate_z");
    const rotateXSlider = document.getElementById("rotate_x");
    const rotateYSlider = document.getElementById("rotate_y");
    const rotateZSlider = document.getElementById("rotate_z");
    const lightIntensitySlider = document.getElementById("light_intensity");
    const lightColorPicker = document.getElementById("light_color");
    const customColorPicker = document.getElementById("custom_color_picker");
    const frostIntensitySlider = document.getElementById("frost_intensity");

    // === Constants ===
    const SLIDE_INTERVAL_MS = 8000;
    const ROTATION_SPEED = 0.05;
    const MIN_TRANSLATE_Z = 0;
    const MAX_TRANSLATE_Z = 240;
    const BACKGROUND_TRANSLATE_Z = -50;
    const INITIAL_ANIMATION_DELAY = 60;

    const INITIAL_SETTINGS = {
        rotateX: 15,
        rotateY: 15,
        rotateZ: 0,
        translateZ: 15,
        lightIntensity: 0.8,
        lightColor: "#7B1EB9",
        frostIntensity: 4,
        frostAnimationSpeed: 0.8
    };

    // === State Variables ===
    let currentRotation = { x: 0, y: 0, z: 0 };
    let targetRotation = { x: 0, y: 0, z: 0 };
    let foregroundRotation = { x: 0, y: 0, z: 0 };
    let lightIntensity = INITIAL_SETTINGS.lightIntensity;
    let lightColor = INITIAL_SETTINGS.lightColor;
    let currentTranslateZ = 0;
    let maxTranslateZ = MAX_TRANSLATE_Z;
    let currentSlideIndex = 0;
    let frostIntensity = INITIAL_SETTINGS.frostIntensity;
    let currentFrostIntensity = frostIntensity;
    let frostAnimationSpeed = INITIAL_SETTINGS.frostAnimationSpeed;
    let frostUpdateActive = false;

    // === Functions ===

    // Map a range of values
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };

    // Initialize all controls with initial values
    const initializeControls = () => {
        rotateXSlider.value = 0;
        rotateYSlider.value = 0;
        rotateZSlider.value = 0;
        translateZSlider.value = 0;
        lightIntensitySlider.value = INITIAL_SETTINGS.lightIntensity;
        lightColorPicker.value = INITIAL_SETTINGS.lightColor;
        customColorPicker.style.backgroundColor = INITIAL_SETTINGS.lightColor;
        frostIntensitySlider.value = 0;
    };

    // Apply default settings after intial animation
    const applyDefaultSettings = () => {
        rotateXSlider.value = INITIAL_SETTINGS.rotateX;
        rotateYSlider.value = INITIAL_SETTINGS.rotateY;
        rotateZSlider.value = INITIAL_SETTINGS.rotateZ;
        translateZSlider.value = INITIAL_SETTINGS.translateZ;

        targetRotation.x = parseFloat(rotateXSlider.value);
        targetRotation.y = parseFloat(rotateYSlider.value);
        targetRotation.z = parseFloat(rotateZSlider.value);
        currentTranslateZ = parseFloat(translateZSlider.value);

        frostIntensitySlider.value = mapRange(
            INITIAL_SETTINGS.frostIntensity,
            0,
            12,
            0,
            120
        );
        frostIntensity = INITIAL_SETTINGS.frostIntensity;

        updateMaxTranslateZ();
        updateLayers();
    };

    // Ease-in-out function
    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t); // Quadratic ease-in-out

    // Smoothly animate sliders to their default values with ease-in-out
    const easeSlidersToDefaults = () => {
        const startTime = performance.now();
        const duration = 300; // Duration of the easing in milliseconds
        const initialValues = {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            translateZ: 0,
            frostIntensity: 0
        };

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const rawProgress = Math.min(elapsed / duration, 1); // Progress between 0 and 1
            const progress = easeInOutQuad(rawProgress); // Apply ease-in-out effect

            // Interpolated values
            rotateXSlider.value =
                initialValues.rotateX +
                progress * (INITIAL_SETTINGS.rotateX - initialValues.rotateX);
            rotateYSlider.value =
                initialValues.rotateY +
                progress * (INITIAL_SETTINGS.rotateY - initialValues.rotateY);
            rotateZSlider.value =
                initialValues.rotateZ +
                progress * (INITIAL_SETTINGS.rotateZ - initialValues.rotateZ);
            translateZSlider.value =
                initialValues.translateZ +
                progress * (INITIAL_SETTINGS.translateZ - initialValues.translateZ);
            frostIntensitySlider.value =
                initialValues.frostIntensity +
                progress * mapRange(INITIAL_SETTINGS.frostIntensity, 0, 12, 0, 120);

            // Update states based on interpolated slider values
            targetRotation.x = parseFloat(rotateXSlider.value);
            targetRotation.y = parseFloat(rotateYSlider.value);
            targetRotation.z = parseFloat(rotateZSlider.value);
            currentTranslateZ = parseFloat(translateZSlider.value);
            frostIntensity = mapRange(
                parseFloat(frostIntensitySlider.value),
                0,
                120,
                0,
                12
            );

            // Apply updates
            updateMaxTranslateZ();
            updateLayers();

            if (rawProgress < 1) {
                requestAnimationFrame(animate); // Continue animation
            } else {
                // Ensure all final states match defaults
                applyDefaultSettings();
            }
        };

        requestAnimationFrame(animate);
    };

    // Update maxTranslateZ based on foreground layer width
    const updateMaxTranslateZ = () => {
        const currentWidth = foregroundLayer.offsetWidth;
        const scale =
            (currentWidth -
                parseFloat(
                    getComputedStyle(foregroundLayer).getPropertyValue("--min-width")
                )) /
            (parseFloat(
                getComputedStyle(foregroundLayer).getPropertyValue("--max-width")
            ) -
                parseFloat(
                    getComputedStyle(foregroundLayer).getPropertyValue("--min-width")
                ));
        maxTranslateZ = MIN_TRANSLATE_Z + scale * (MAX_TRANSLATE_Z - MIN_TRANSLATE_Z);
    };

    // Update transforms for background and foreground layers
    const updateLayers = () => {
        const percentage = parseFloat(translateZSlider.value) / 100;
        const targetTranslateZ =
            MIN_TRANSLATE_Z + percentage * (maxTranslateZ - MIN_TRANSLATE_Z);
        currentTranslateZ += (targetTranslateZ - currentTranslateZ) * ROTATION_SPEED;

        backgroundLayer.style.transform = `
            rotateX(${currentRotation.x}deg)
            rotateY(${currentRotation.y}deg)
            rotateZ(${currentRotation.z}deg)
            translateZ(${BACKGROUND_TRANSLATE_Z}px)
        `;
        foregroundLayer.style.transform = `
            rotateX(${foregroundRotation.x}deg)
            rotateY(${foregroundRotation.y}deg)
            rotateZ(${foregroundRotation.z}deg)
            translateX(${currentRotation.y * -0.03}px)
            translateY(${currentRotation.x * -0.03}px)
            translateZ(${currentTranslateZ}px)
        `;
    };

    const updateLighting = () => {
        const lightX = (currentRotation.y / 30) * 100;
        const lightY = (currentRotation.x / 30) * 100;
        const [r, g, b] = lightColor.match(/\w\w/g).map((c) => parseInt(c, 16));
        const rgbaColor = `rgba(${r}, ${g}, ${b}, ${lightIntensity})`;

        ambientLightLayer.style.background = `
            radial-gradient(circle at ${50 + lightX}% ${50 + lightY
            }%, ${rgbaColor}, transparent 100%)
        `;
        ambientLightLayer.style.opacity = lightIntensity;

        slideshow.style.filter = `brightness(${Math.max(
            lightIntensity,
            0.1
        )}) contrast(${0.8 + lightIntensity * 0.5})`;
    };

    const updateFrostEffect = () => {
        if (!frostUpdateActive) return;
        const delta = frostIntensity - currentFrostIntensity;
        if (Math.abs(delta) < 0.01) {
            frostUpdateActive = false;
            currentFrostIntensity = frostIntensity;
        } else {
            currentFrostIntensity += delta * frostAnimationSpeed;
            const blurValue = `${currentFrostIntensity.toFixed(2)}px`;
            foregroundLayer.style.backdropFilter = `blur(${blurValue})`;
            foregroundLayer.style.webkitBackdropFilter = `blur(${blurValue})`;
            requestAnimationFrame(updateFrostEffect);
        }
    };

    // Event Listener for Frost Slider
    frostIntensitySlider.addEventListener("input", (e) => {
        frostIntensity = mapRange(parseFloat(e.target.value), 0, 120, 0, 12);
        if (!frostUpdateActive) {
            frostUpdateActive = true;
            updateFrostEffect();
        }
    });

    // Shuffle the animations array
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Show a specific slide
    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.style.opacity = i === index ? "1" : "0";
        });

        const img = slides[index].querySelector("img");
        img.style.animation = "none";
        void img.offsetWidth; // Trigger reflow to reset animation

        const animations = shuffleArray([
            "panRight",
            "panDown",
            "panLeft",
            "panUp",
            "panZoomInRight",
            "panZoomOutDown",
            "panZoomInDiagonalDownRight",
            "panZoomOutDiagonalUpLeft",
            "panZoomInTopLeftToBottomRight",
            "panZoomOutBottomRightToTopLeft"
        ]);

        // Select a random animation for the current slide
        const animation = animations[0];
        img.style.animation = `${animation} 10s ease-in-out infinite`;
    };

    const nextSlide = () => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
    };

    // Animate layers and rotation
    const animateRotation = () => {
        currentRotation.x += (targetRotation.x - currentRotation.x) * ROTATION_SPEED;
        currentRotation.y += (targetRotation.y - currentRotation.y) * ROTATION_SPEED;
        currentRotation.z += (targetRotation.z - currentRotation.z) * ROTATION_SPEED;

        foregroundRotation.x = currentRotation.x * 0.8;
        foregroundRotation.y = currentRotation.y * 0.8;
        foregroundRotation.z = currentRotation.z * 0.8;

        updateLayers();
        updateLighting();
        requestAnimationFrame(animateRotation);
    };

    // === Event Listeners ===
    [rotateXSlider, rotateYSlider, rotateZSlider].forEach((slider) => {
        slider.addEventListener("input", () => {
            targetRotation.x = parseFloat(rotateXSlider.value);
            targetRotation.y = parseFloat(rotateYSlider.value);
            targetRotation.z = parseFloat(rotateZSlider.value);
        });
    });

    translateZSlider.addEventListener("input", updateLayers);

    lightIntensitySlider.addEventListener("input", (e) => {
        lightIntensity = parseFloat(e.target.value);
    });

    customColorPicker.addEventListener("click", () => {
        lightColorPicker.click();
    });

    lightColorPicker.addEventListener("input", (e) => {
        lightColor = e.target.value;
        customColorPicker.style.backgroundColor = lightColor;
    });

    window.addEventListener("resize", () => {
        updateMaxTranslateZ();
        updateLayers();
    });

    // === Initial Setup ===
    initializeControls();
    showSlide(currentSlideIndex);
    setTimeout(() => easeSlidersToDefaults(), INITIAL_ANIMATION_DELAY);
    setInterval(nextSlide, SLIDE_INTERVAL_MS);
    updateMaxTranslateZ();
    animateRotation();

    // === Links Validation ===
    // https://assets.codepen.io/573855/lr-utils.js
    const isCodePen = document.referrer.includes("codepen.io");
    const hostDomains = isCodePen ? ["codepen.io"] : [];
    hostDomains.push(window.location.hostname);

    const links = document.getElementsByTagName("a");
    for (let link of links) {
        link.innerHTML = LR.utils.urlUtils.escapeHtml(link.innerHTML);
    }
    LR.utils.urlUtils.validateLinks(links, hostDomains);
});
