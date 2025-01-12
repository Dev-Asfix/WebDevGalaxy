document.querySelector(".nav-toggle").addEventListener("click", () => {
    document.querySelector(".nav-list").classList.toggle("show");
});

document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you for your message!");
});
