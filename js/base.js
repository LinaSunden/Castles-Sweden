const googleApiKey = "AIzaSyBPFwiBJ-kucTxkQu3DVVuNSZDdY3geCrQ";

document.addEventListener('DOMContentLoaded', function () {
    /**
     * Load google maps script with api key and callback function
     * @param {*} apiKey 
     * @param {*} callback 
     */
    function loadGoogleMapsScript(apiKey, callback) {
        const googleMapsScript = document.createElement('script');
        googleMapsScript.async = true;
        googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callback}`;
    
        document.body.appendChild(googleMapsScript);
    }
    
    loadGoogleMapsScript(`${googleApiKey}`, 'initializeMap');
    
});


/**
 * Place castle to a map with google maps api
 */
function initializeMap(){

    //Settings for map when the page loads
    var options = {
        center: {lat: 59.27412 , lng: 15.2066},
        zoom: 6 
    }

    //create map
    map = new google.maps.Map(document.getElementById('map'), options);

 
  /**
   * Add marker to map and tower icon where there is a castle
   * @param {*} property 
   */
  function addMarker(property){
    const marker = new google.maps.Marker({
        position: property.location,
        map: map,
        icon: {
            url: "img/tower.png",
            scaledSize: new google.maps.Size(50, 50)

        },
        title: property.label

    });

    const detailWindow = new google.maps.InfoWindow({
        content: property.content
    });

    marker.addListener('click', () => {
    detailWindow.open(map, marker);
    })
}


    /**
     * Loop through castles, add marker to map and add info about castle
     */
    function putCastlesWithInfoOnMap(){
        fetchCastleInfo().then(data => {
            data.forEach(castle => {
            addMarker({
                location:{
                    lat: castle.location.latitude,
                    lng: castle.location.longitude
                },
                label: castle.name,
                content: 
                `<h2 class="font-bold text-base">${castle.name}</h2>
                <p class="my-2">Byggnadsår: ${castle.buildYear}</p>
                <a href="${castle.img}" target="_blank">
                <img src="${castle.img}" alt="${castle.name}" class="h-32 w-auto"></a>
                <p class="text-blue-500 underline mt-2"><a href="${castle.url}" target="_blank">Läs mer</a></p>`
            })    
            });
            })
    }
    
    putCastlesWithInfoOnMap();
 
}

/**
 * Fetch information about castles in Sweden from a JSON file.
 * @returns information about castles in Sweden
 */
async function fetchCastleInfo() {
    try {
        const response = await fetch('/json/castlesSweden.json');
        const data = await response.json();
        console.log(data);
        return data;
        
    } catch (error) {
        console.error('Error fetching castle information:', error);
        return null;
    } 
}


/**
 * Show castles on home page in letter order with information about castle
 */
function showCastles(){
    fetchCastleInfo().then(data => {
       // Sort the castles alphabetically by name
       data.sort((a, b) => a.name.localeCompare(b.name, 'sv'));

        data.forEach(castle => {
            const castleElement = document.createElement('div');
            castleElement.classList.add('flex', 'flex-col', 'justify-center', 'items-center',
            'border-solid', 'border-gray-300', 'border-2', 'rounded', 'p-2', 'm-2', 'bg-white');
            const castleId = castle.name.replace(/\s/g, '_'); 
            const weatherContainerId = `weather_${castleId}`;
            castleElement.innerHTML = `
                <h2 class="font-bold text-base">${castle.name}</h2>
                <p class="my-2">Byggnadsår: ${castle.buildYear}</p>
                <a href="${castle.img}" target="_blank">
                <img src="${castle.img}" alt="${castle.name}" class="h-36 w-auto"></a>
                <button class="bg-steel-blue hover:bg-delft-blue text-white font-bold w-48 py-2 px-4 
                rounded my-2" onclick="window.open('${castle.url}', '_blank')">Läs mer</button>
                <button class="bg-steel-blue hover:bg-delft-blue text-white font-bold w-48 py-2 px-4 
                rounded my-2" onclick="addSeTodaysWeather('${castle.name}', '${weatherContainerId}')">Dagens väder</button>
                <div id="${weatherContainerId}"></div>
            `;
            document.getElementById('castles').appendChild(castleElement);
        });
    });
}

showCastles();

/**
 * Fetch todays weather for a specific location
 * @param {*} latitude 
 * @param {*} longitude 
 * @returns 
 */
async function getWeather(latitude, longitude){
    const URL = `https://api.weatherapi.com/v1/current.json?q=${latitude}%2C%20${longitude}&lang=sv&key=6ecbee3207974540b95164701240701`;
    const response = await fetch(URL);
    const weather = await response.json();
    return weather;   
}

/**
 * Show todays weather for a specific castles location
 * @param {*} castleName 
 * @param {*} weatherContainerId 
 * @returns 
 */
async function addSeTodaysWeather(castleName, weatherContainerId) {
    try {
        // Fetch castle information
        const castles = await fetchCastleInfo();

        // Find the castle with the given name
        const castle = castles.find(c => c.name === castleName);

        if (!castle) {
            console.error(`Castle with name '${castleName}' not found.`);
            return;
        }

        // Check if the castle has valid coordinates
        if (!castle.location || typeof castle.location.latitude === 'undefined' || typeof castle.location.longitude === 'undefined') {
            console.error(`Castle '${castleName}' has invalid coordinates.`);
            return;
        }

        // Get weather for the castle's coordinates
        const weather = await getWeather(castle.location.latitude, castle.location.longitude);

        // Check if 'current' property exists in the weather response
        if (weather && weather.current) {
            // Display the weather information below the corresponding castle
            document.getElementById(weatherContainerId).innerHTML = 
                `<h2 class="font-bold">Vädret vid ${castle.name}</h2>
                <p>${weather.current.condition.text}</p>
                <img src="${weather.current.condition.icon}" alt="${weather.current.condition.text}"> 
                <p>Temperatur: <span class="font-bold">${weather.current.temp_c}°C </span></p> 
                <p>Upplevd temperatur: ${weather.current.feelslike_c}°C</p>
                <p>Vindhastighet: ${weather.current.wind_kph} km/h</p>
                <p>Senast uppdaterad: ${weather.current.last_updated}</p>`;
        } else {
            console.error('Weather data is incomplete or undefined.');
        }
    } catch (error) {
        console.error('Error in addSeTodaysWeather:', error);
    }
}