document.getElementById('analyze-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: analyzePerformance
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            displayResults(results[0].result);
          }
        }
      );
    });
  });
  
  function analyzePerformance() {
    const performance = window.performance;
    const timing = performance.timing;
    const navigationEntries = performance.getEntriesByType('navigation')[0];
    
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;

    let firstPaint = 0;
    let firstContentfulPaint = 0;

    if (navigationEntries) {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
            if (entry.name === 'first-paint') {
                firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
                firstContentfulPaint = entry.startTime;
            }
        });
    }

    const suggestions = [];

    if (loadTime > 3000) {
        suggestions.push('Reduce page load time. Consider optimizing images, reducing CSS and JS sizes.');
    }

    if (domContentLoadedTime > 2000) {
        suggestions.push('Improve DOM Content Loaded time. Minimize DOM tree depth and complexity.');
    }

    return {
        loadTime,
        domContentLoadedTime,
        firstPaint,
        firstContentfulPaint,
        suggestions
    };
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <p><strong>Page Load Time:</strong> ${results.loadTime} ms</p>
        <p><strong>DOM Content Loaded Time:</strong> ${results.domContentLoadedTime} ms</p>
        <p><strong>First Paint:</strong> ${results.firstPaint} ms</p>
        <p><strong>First Contentful Paint:</strong> ${results.firstContentfulPaint} ms</p>
        <h3>Suggestions:</h3>
        <ul>${results.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}</ul>
    `;
}


  