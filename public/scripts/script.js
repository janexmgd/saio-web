const handleFormSubmit = async (event) => {
  event.preventDefault();

  const urlInput = document.getElementById('url');
  const url = urlInput.value.trim();

  if (!url) {
    alert('Please provide a valid URL!');
    return;
  }

  try {
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

    // Step 1: Fetch metadata from external API
    const res = await fetch('https://saio-api.vercel.app/service', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent.split(' Chrome/1')[0],
      },
    });
    const data = await res.json();
    if (!data || !data.data || !data.data.content) {
      throw new Error('Invalid data from external API');
    }

    const { playAddr } = data.data.content.video;
    const cookie = data.data.cookie;
    const filename = `${data.data.content.author.uniqueId}_${data.data.content.id}.mp4`;

    // Step 2: Send POST request to server's /download endpoint
    const response = await fetch('/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'User-Agent': userAgent.split(' Chrome/1')[0],
      },
      body: JSON.stringify({
        url: playAddr,
        cookie,
      }),
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('An error occurred while downloading the file.');
  }
};
