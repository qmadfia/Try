// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });

    // Learn more button interaction
    const learnMoreButton = document.getElementById("learn-more");
    learnMoreButton.addEventListener("click", function () {
        const aboutSection = document.getElementById("about");
        window.scrollTo({
            top: aboutSection.offsetTop,
            behavior: "smooth"
        });
    });

    // Contact form submission
    const contactForm = document.getElementById("contact-form");
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        if (name && email && message) {
            alert(`Thank you, ${name}! Your message has been sent.`);
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
    });

    galleryImages.forEach(img => {
        observer.observe(img);
    });
});
