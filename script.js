const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
});

const tableElements = document.querySelectorAll('.tableau');
tableElements.forEach((tableElement) => {
    observer.observe(tableElement);
});