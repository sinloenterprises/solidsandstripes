document.addEventListener('DOMContentLoaded', (event) => {
    const videoElement = document.getElementById('video-element');
    const introVideo = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');

    videoElement.addEventListener('ended', () => {
        introVideo.style.display = 'none';
        mainContent.classList.remove('hidden');
    });
});
