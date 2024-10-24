const canvas = document.querySelector('.image-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.9;
}

resizeCanvas();

let images = [];
let xOffset = 0;
let yOffset = 0;
let isDragging = false;
let lastX = 0, lastY = 0;
let movedDistance = 0;
const gap = 5;
let scale = 1;
let lastScale = 1;
let pinchDistance = 0;
const minScale = 0.5;
const maxScale = 2;

const imageSources = [
  'images/image1.jpg',
  'images/image2.jpg',
  'images/image3.jpg',
  'images/image4.jpg',
  'images/image5.jpg',
  'images/image6.jpg',
  'images/image7.jpg',
  'images/image8.jpg',
  'images/image9.jpg',
  'images/image10.jpg',
  'images/image11.jpg',
  'images/image12.jpg',
  'images/image13.jpg',
  'images/image14.jpg',
  'images/image15.jpg',
  'images/image16.jpg',
  'images/image17.jpg',
  'images/image18.jpg',
  'images/image19.jpg',
  'images/image20.jpg',
  'images/image21.jpg',
  'images/image22.jpg',
  'images/image23.jpg',
  'images/image24.jpg',
  'images/image25.jpg',
  'images/image26.jpg',
  'images/image27.jpg',
  'images/image28.jpg',
  'images/image29.jpg',
  'images/image30.jpg',
  'images/image31.jpg',
  'images/image32.jpg',
  'images/image33.jpg',
  'images/image34.jpg',
];

function loadImages(sources) {
  return Promise.all(sources.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.loading = 'lazy';
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }));
}

function getImagesPerRow() {
  if (window.innerWidth < 325) {
      return 1;
  } else if (window.innerWidth >= 325 && window.innerWidth <= 1184) {
      return 3;
  } else {
      return 7;
  }
}

function resizeImage(img, imagesPerRow) {
  const maxImageWidth = (canvas.width / imagesPerRow) - gap;
  const aspectRatio = img.width / img.height;
  const imageWidth = Math.min(maxImageWidth, img.width);
  const imageHeight = imageWidth / aspectRatio;
  return { width: imageWidth, height: imageHeight };
}

let imagePositions = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function categorizeImages(images, imagesPerRow) {
  const categorizedImages = [];
  images.forEach(image => {
      const { width, height } = resizeImage(image, imagesPerRow);
      categorizedImages.push({ image, width, height });
  });
  return categorizedImages;
}

function calculateImagePositions() {
  imagePositions = [];
  const imagesPerRow = getImagesPerRow();
  const gap = 10;
  const categorizedImages = categorizeImages(images, imagesPerRow);
  const shuffledImages = shuffleArray(categorizedImages);
  let columnHeights = Array(imagesPerRow).fill(gap);

  for (let i = 0; i < shuffledImages.length; i++) {
      const { image, width, height } = shuffledImages[i];
      const col = i % imagesPerRow;
      const x = col * (width + gap) + gap;
      const y = columnHeights[col];
      imagePositions.push({ x: x, y: y, width: width, height: height, img: image });
      columnHeights[col] += height + gap;
  }
}

function drawImages() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);
  imagePositions.forEach((pos) => {
      const { x, y, width, height, img } = pos;
      ctx.drawImage(img, (x + xOffset) / scale, (y + yOffset) / scale, width, height);
  });
  ctx.restore();
}

canvas.addEventListener('click', function(event) {
  if (movedDistance < 5) {
      const canvasRect = canvas.getBoundingClientRect();
      const clickX = (event.clientX - canvasRect.left - xOffset) / scale;
      const clickY = (event.clientY - canvasRect.top - yOffset) / scale;
      imagePositions.forEach((pos, index) => {
          if (clickX >= pos.x && clickX <= pos.x + pos.width &&
              clickY >= pos.y && clickY <= pos.y + pos.height) {
              window.location.href = `image-detail.html?image=${index + 1}`;
          }
      });
  }
});

canvas.addEventListener('mousedown', (event) => {
  isDragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  movedDistance = 0;
  canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      xOffset += dx;
      yOffset += dy;
      lastX = event.clientX;
      lastY = event.clientY;
      movedDistance += Math.sqrt(dx * dx + dy * dy);
      drawImages();
    }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

function getDistance(touch1, touch2) {
  return Math.sqrt((touch2.clientX - touch1.clientX) ** 2 + (touch2.clientY - touch1.clientY) ** 2);
}

canvas.addEventListener('touchstart', (event) => {
  if (event.touches.length === 2) {
      pinchDistance = getDistance(event.touches[0], event.touches[1]);
      lastScale = scale;
  } else if (event.touches.length === 1) {
      isDragging = true;
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
      movedDistance = 0;
      canvas.style.cursor = 'grabbing';
  }
});

canvas.addEventListener('touchmove', (event) => {
  if (event.touches.length === 2) {
      const newPinchDistance = getDistance(event.touches[0], event.touches[1]);
      scale = lastScale * (newPinchDistance / pinchDistance);

      scale = Math.min(Math.max(scale, minScale), maxScale);

      drawImages();
  } else if (event.touches.length === 1 && isDragging) {
      const dx = event.touches[0].clientX - lastX;
      const dy = event.touches[0].clientY - lastY;
      xOffset += dx;
      yOffset += dy;
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
      movedDistance += Math.sqrt(dx * dx + dy * dy);
      drawImages();
  }
});

canvas.addEventListener('touchend', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('touchcancel', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

loadImages(imageSources).then(loadedImages => {
  images = loadedImages;
  calculateImagePositions();
  drawImages();
}).catch(error => {
  console.error("Error loading images: ", error);
});

window.addEventListener('resize', () => {
  resizeCanvas();
  calculateImagePositions();
  drawImages();
});