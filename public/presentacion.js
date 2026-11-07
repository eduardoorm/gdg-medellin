(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const currentLabel = document.querySelector('#current-slide');
  const totalLabel = document.querySelector('#total-slides');
  const progress = document.querySelector('#progress-fill');
  const previousButton = document.querySelector('.prev-button');
  const nextButton = document.querySelector('.next-button');
  const fullscreenButton = document.querySelector('.fullscreen-button');
  const deck = document.querySelector('#deck');
  const profileQr = document.querySelector('#profile-qr');
  const qrMatrix = [
    '111111101100111101000111101111111',
    '100000101011000100110001001000001',
    '101110100000101011101010101011101',
    '101110101101111100111010101011101',
    '101110101011110101111000101011101',
    '100000101111011001011000101000001',
    '111111101010101010101010101111111',
    '000000000010110001011111000000000',
    '000100100110001010111101000111011',
    '111110010010101101100000101000111',
    '001001100111010000111110010001101',
    '001111001010110010110001111000000',
    '111111111100011001010001111010011',
    '001011000110101000001010011000101',
    '110110101010011101010101110001010',
    '011101000110101101001110010010111',
    '101100111000100011101100001010110',
    '001111010110001011100101000000111',
    '111100100001001110111110001110101',
    '111001000111000100101100010010010',
    '100111100110110110101101100000000',
    '011001011000011110100001100001111',
    '110110111110101101011011111001101',
    '010110010110011100111111111001000',
    '101101110011010110101111111111010',
    '000000001011100111001101100010101',
    '111111100101111100101010101010010',
    '100000100011110110011110100010001',
    '101110100010001111011000111110000',
    '101110101111010111101011001010001',
    '101110100110001000100101110111101',
    '100000100101111110111011110111000',
    '111111100000110011000000110110110',
  ];
  let currentIndex = 0;
  let touchStartX = 0;

  function renderProfileQr() {
    const path = [];

    qrMatrix.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        while (x < row.length && row[x] !== '1') x += 1;
        if (x >= row.length) break;

        const start = x;
        while (x < row.length && row[x] === '1') x += 1;
        const width = x - start;
        path.push(`M${start + 4} ${y + 4}h${width}v1h-${width}z`);
      }
    });

    profileQr.querySelector('path').setAttribute('d', path.join(''));
  }

  const formatNumber = (number) => String(number).padStart(2, '0');
  renderProfileQr();
  totalLabel.textContent = formatNumber(slides.length);

  function showSlide(index, updateHistory = true) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      if (isActive) slide.scrollTop = 0;
    });

    currentLabel.textContent = formatNumber(currentIndex + 1);
    progress.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;

    if (updateHistory) {
      history.replaceState(null, '', `#slide-${currentIndex + 1}`);
    }
  }

  function fromHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (match) showSlide(Number(match[1]) - 1, false);
  }

  previousButton.addEventListener('click', () => showSlide(currentIndex - 1));
  nextButton.addEventListener('click', () => showSlide(currentIndex + 1));

  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('a, button, input, textarea, select')) {
      if (event.key !== 'Escape') return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        event.preventDefault();
        showSlide(currentIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        showSlide(currentIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        showSlide(0);
        break;
      case 'End':
        event.preventDefault();
        showSlide(slides.length - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) document.exitFullscreen();
        break;
      default:
        break;
    }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      deck.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  fullscreenButton.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenButton.setAttribute('aria-label', isFullscreen ? 'Salir de pantalla completa' : 'Activar pantalla completa');
    fullscreenButton.title = isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa';
  });

  deck.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  deck.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 55) return;
    showSlide(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('hashchange', fromHash);
  fromHash();
  showSlide(currentIndex, false);
})();
