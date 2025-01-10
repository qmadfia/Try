// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll(".navbar a");

    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Offset for fixed header
                    behavior: "smooth"
                });
            }
        });
    });

    // Interactive typing effect for hero section
    const typingText = ["Building Ideas into Reality", "Creating Futuristic Designs", "Innovating the Web"];
    const heroText = document.querySelector(".hero h2");
    let typingIndex = 0;
    let charIndex = 0;

    function typeEffect() {
        if (charIndex < typingText[typingIndex].length) {
            heroText.textContent += typingText[typingIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeEffect, 100);
        } else {
            setTimeout(() => {
                charIndex = 0;
                heroText.textContent = "";
                typingIndex = (typingIndex + 1) % typingText.length;
                typeEffect();
            }, 2000);
        }
    }

    typeEffect();

    // Dynamic skills progress bars
    const skillItems = document.querySelectorAll(".skill");

    skillItems.forEach(skill => {
        const percentage = skill.getAttribute("data-percentage");
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.style.width = "0%";
        progressBar.style.transition = "width 1s ease";
        skill.appendChild(progressBar);

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressBar.style.width = percentage;
                    observer.unobserve(skill);
                }
            });
        });

        observer.observe(skill);
    });

    // Contact form submission with animation
    const contactForm = document.getElementById("contact-form");
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        if (name && email && message) {
            const confirmationMessage = document.createElement("div");
            confirmationMessage.className = "confirmation-message";
            confirmationMessage.textContent = `Thank you, ${name}! Your message has been sent.`;
            contactForm.appendChild(confirmationMessage);

            setTimeout(() => {
                confirmationMessage.remove();
            }, 3000);

            contactForm.reset();
        } else {
            alert("Please fill out all fields before submitting.");
        }
    });

    // Lazy loading for gallery images
    const galleryImages = document.querySelectorAll(".gallery-grid img");
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute("data-src");
                if (src) {
                    img.src = src;
                    img.removeAttribute("data-src");
                }
                observer.unobserve(img);
            }
        });
    }, { threshold: 0.1 });

    galleryImages.forEach(img => {
        observer.observe(img);
    });

    // Back-to-top button
    const backToTop = document.createElement("button");
    backToTop.id = "back-to-top";
    backToTop.textContent = "↑";
    backToTop.style.display = "none";
    backToTop.style.position = "fixed";
    backToTop.style.bottom = "20px";
    backToTop.style.right = "20px";
    backToTop.style.padding = "10px";
    backToTop.style.background = "#007cf0";
    backToTop.style.color = "white";
    backToTop.style.border = "none";
    backToTop.style.borderRadius = "50%";
    backToTop.style.cursor = "pointer";
    backToTop.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
    document.body.appendChild(backToTop);

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTop.style.display = "block";
        } else {
            backToTop.style.display = "none";
        }
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});
