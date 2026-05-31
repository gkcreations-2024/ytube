document.getElementById('videoForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const videoURL = document.getElementById('videoURL').value;

  // Make an API request to the backend to fetch video data
  fetch(`/fetch-video-info?url=${encodeURIComponent(videoURL)}`)
      .then(response => response.json())
      .then(videoData => {
          if (videoData.error) {
              // Handle error if any
              alert(videoData.error);
          } else {
              // Show video details
              document.getElementById('videoTitle').textContent = videoData.title;
              document.getElementById('videoDuration').textContent = `Duration: ${videoData.duration}`;
              document.getElementById('videoThumbnail').src = videoData.thumbnail;
            
              document.getElementById('videoDetails').classList.remove('hidden');
            
              // Handle download button
              document.getElementById('downloadButton').addEventListener('click', function () {
                  startDownload(videoData.url);
              });
          }
      })
      .catch(error => {
          console.error("Error fetching video info:", error);
          alert("Failed to fetch video info. Please try again.");
      });
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("videoForm");
  const submitBtn = document.getElementById("submitButton");

  form.addEventListener("submit", () => {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="loader"></div> Downloading...
    `;
  });
});

function startDownload(videoURL) {
  // Show the download progress circle
  document.getElementById('downloadingCircle').classList.remove('hidden');
  document.getElementById('downloadPercentage').textContent = '0%';

  let progress = 0;
  const interval = setInterval(function () {
      progress += 10;
      document.getElementById('downloadPercentage').textContent = `${progress}%`;

      // Simulate download complete
      if (progress >= 100) {
          clearInterval(interval);
          downloadVideo(videoURL);
      }
  }, 500);
}

function downloadVideo(videoURL) {
  // Start the actual download (can be an API request to the backend)
  fetch(`/download?url=${encodeURIComponent(videoURL)}`)
      .then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'video.mp4'; // You can set a more dynamic name if needed
          a.click();
          URL.revokeObjectURL(url);
          showSuccessMessage();
      })
      .catch(error => {
          console.error('Download failed', error);
          alert("Download failed. Please try again.");
      });
}

function showSuccessMessage() {
  // Hide the progress circle
  document.getElementById('downloadingCircle').classList.add('hidden');

  // Show the success message and celebration effect
  document.getElementById('successMessage').classList.remove('hidden');
  document.getElementById('celebrationEffect').style.display = 'block';
}
