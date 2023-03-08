const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } //else {
        //     entry.target.classList.remove('visible');
        // }
    });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((Element) => {
    observer.observe(Element);
});

let age = Date.now() - new Date(2000, 10, 7);
ageDiv = document.getElementById('age');
ageDiv.innerHTML = "<b>Age : " +Math.floor(age / 31536000000)+" ⏰</b>";