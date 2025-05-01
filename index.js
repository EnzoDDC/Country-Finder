const searchInput = document.querySelector('#search');
const container = document.querySelector('.container');
const body = document.querySelector('.main');
const formContainer = document.querySelector('.form-container');
const title = document.querySelector('.title');

//https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid={9b2f6a51da935f3881fe5d559bf86ce6} ----- api clima
//https://restcountries.com/v3.1/all ----- api paises


let countries = [];

const getCountries = async () => {
  try {
    container.innerHTML = '<div class="loading">Cargando países...</div>';

    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) {
      throw new Error('No se pudieron obtener los datos de los países');
    }
    
    countries = await response.json();
    container.innerHTML = '';
  } catch (error) {
    console.log(error);
    container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

// Función para obtener datos del clima
const getWeatherData = async (lat, lon) => {
  try {
    const apiKey = '9b2f6a51da935f3881fe5d559bf86ce6';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      throw new Error('No se pudo obtener la información del clima');
    }
    
    return await response.json();
  } catch (error) {
    console.log(error);
    return null;
  }
};

const showCountryDetail = async (country) => {
  try {
    container.innerHTML = '<div class="loading">Cargando información del clima...</div>';

    const weatherData = await getWeatherData(country.latlng[0], country.latlng[1]);
    
    const population = new Intl.NumberFormat().format(country.population);
    
    let weatherHtml = '<p>Información del clima no disponible</p>';
    if (weatherData) {
      weatherHtml = `
        <div class="weather">
          <h3>Clima en ${country.capital ? country.capital[0] : country.name.common}</h3>
          <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="${weatherData.weather[0].description}">
          <p>Temperatura: ${Math.round(weatherData.main.temp)}°C</p>
          <p>Clima: ${weatherData.weather[0].description}</p>
        </div>
      `;
    }
    
    container.innerHTML = `
      <div class="country-detail">
        <img src="${country.flags.svg}" alt="Bandera de ${country.name.common}" class="flag-detail">
        <h2>${country.name.common}</h2>
        <div class="info">
          <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'No disponible'}</p>
          <p><strong>Habitantes:</strong> ${population}</p>
          <p><strong>Región:</strong> ${country.region}</p>
        </div>
        ${weatherHtml}
        <button class="back-btn">Volver a la búsqueda</button>
      </div>
    `;
    
    document.querySelector('.back-btn').addEventListener('click', () => {
      searchInput.value = '';
      container.innerHTML = '';
    });
    
  } catch (error) {
    console.log(error);
    container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
};

const showCountriesList = (filteredCountries) => {
  container.innerHTML = `
    <div class="countries-list">
      ${filteredCountries.map(country => `
        <div class="country-card" data-name="${country.name.common}">
          <img src="${country.flags.svg}" alt="Bandera de ${country.name.common}" class="flag">
          <h3>${country.name.common}</h3>
        </div>
      `).join('')}
    </div>
  `;
  
  document.querySelectorAll('.country-card').forEach(card => {
    card.addEventListener('click', () => {
      const countryName = card.getAttribute('data-name');
      const selectedCountry = countries.find(c => c.name.common === countryName);
      showCountryDetail(selectedCountry);
    });
  });
};

getCountries();

searchInput.addEventListener('input', async e => {
  const searchTerm = e.target.value.trim().toLowerCase();
  
  if (searchTerm === '') {
    container.innerHTML = '';
    return;
  }
  
  const filteredCountries = countries.filter(country => 
    country.name.common.toLowerCase().includes(searchTerm) ||
    (country.name.official && country.name.official.toLowerCase().includes(searchTerm))
  );


  if (filteredCountries.length > 10) {
    container.innerHTML = `
      <div class="message">
        <p>Por favor, haz tu búsqueda más específica. Hay demasiados resultados (${filteredCountries.length}).</p>
      </div>
    `;
  } else if (filteredCountries.length > 1) {
    showCountriesList(filteredCountries);
  } else if (filteredCountries.length === 1) {
    await showCountryDetail(filteredCountries[0]);
  } else {
    container.innerHTML = `
      <div class="message">
        <p>No se encontraron países que coincidan con tu búsqueda.</p>
      </div>
    `;
  }
});
