  const slider = document.querySelector('.testimonial-slider');
  slider.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) slider.scrollLeft += 100;
    else slider.scrollLeft -= 100;
    e.preventDefault();
  });
