import { config } from '../config2.js'; // Import the config

const apiKey = config.apiKey;

const fetchData = async () => {
  try {
    const response = await fetch('https://api.example.com/data', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: \${response.status}`);
    }
    const result = await response.json();
    displayData(result);
  } catch (error) {
    displayError(error);
  }
};

const displayData = (data) => {
  const rootElement = document.getElementById('root');
  const dataDisplay = document.createElement('pre');
  dataDisplay.textContent = JSON.stringify(data, null, 2);
  rootElement.innerHTML = '<h1>Data:</h1>'; // Clear previous content
  rootElement.appendChild(dataDisplay);
};

const displayError = (error) => {
  const rootElement = document.getElementById('root');
  const errorDisplay = document.createElement('p');
  errorDisplay.style.color = 'red';
  errorDisplay.textContent = `Error: \${error.message}`;
  rootElement.innerHTML = ''; // Clear previous content
  rootElement.appendChild(errorDisplay);
};

fetchData();
