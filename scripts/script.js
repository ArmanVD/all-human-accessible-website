const canvas = document.querySelector('.image-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.9;

let images = [];
let xOffset = 0;
let yOffset = 0;
let isDragging = false;
let lastX = 0, lastY = 0;
const maxImageWidth = canvas.width / 7;

const imageSources = [
    'images/image1.jpg',
    'images/image2.jpg',
    'images/image3.jpg',
    'images/image4.jpg'
];

function loadImages(sources) {
    return Promise.all(sources.map(src => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }));
}

function resizeImage(img) {
    const aspectRatio = img.width / img.height;
    const newWidth = maxImageWidth; 
    const newHeight = newWidth / aspectRatio;
    return { width: newWidth, height: newHeight };
}

function drawImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let y = yOffset;

    images.forEach((img, index) => {
        const resizedImg = resizeImage(img);
        ctx.drawImage(img, xOffset, y, resizedImg.width, resizedImg.height);
        y += resizedImg.height + 5;
    });
}

canvas.addEventListener('click', function(event) {
    const canvasRect = canvas.getBoundingClientRect();
    const x = event.clientX - canvasRect.left - xOffset;
    const y = event.clientY - canvasRect.top - yOffset;

    let cumulativeY = 0;
    images.forEach((img, index) => {
        const resizedImg = resizeImage(img);
        if (y >= cumulativeY && y <= cumulativeY + resizedImg.height) {
            window.location.href = `image-detail.html?image=${index + 1}`;
        }
        cumulativeY += resizedImg.height + 5;
    });
});

canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
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

canvas.addEventListener('touchstart', (event) => {
    isDragging = true;
    lastX = event.touches[0].clientX;
    lastY = event.touches[0].clientY;
});

canvas.addEventListener('touchmove', (event) => {
    if (isDragging) {
        const dx = event.touches[0].clientX - lastX;
        const dy = event.touches[0].clientY - lastY;

        xOffset += dx;
        yOffset += dy;

        lastX = event.touches[0].clientX;
        lastY = event.touches[0].clientY;

        drawImages();
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

canvas.addEventListener('wheel', (event) => {
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;

    xOffset -= deltaX;
    yOffset -= deltaY;

    drawImages(); 
});

loadImages(imageSources).then(loadedImages => {
    images = loadedImages;
    drawImages();
}).catch(error => {
    console.error("Error loading images: ", error);
});
