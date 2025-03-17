// Replace this with your actual API key
const apiKey = 'a4jawM4BVFAHWry315eAhB2GHKLLu7Ic'; // Your IDFM API token
const stopPointId = 'STIF:StopPoint:Q:7849:'; // The ID of the bus stop you want to monitor
const apiUrl = `https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=STIF:StopPoint:Q:7849:`;

// Function to fetch bus arrival data from the IDFM API
async function fetchBusArrivals() {
    try {
        console.log('Fetching bus arrival data...'); // Log the start of the API request

        // Include the API key in the headers
        const headers = {
            'apiKey': apiKey // Add the API key to the headers
        };

        const response = await fetch(apiUrl, {
            headers: headers // Pass the headers in the fetch request
        });

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        console.log('API Response:', data); // Log the API response for debugging

        // Check if the data structure is valid
        if (!data || !data.Siri || !data.Siri.ServiceDelivery || !data.Siri.ServiceDelivery.StopMonitoringDelivery) {
            throw new Error('Invalid API response structure.');
        }

        displayArrivals(data); // Display the data
    } catch (error) {
        console.error('Error fetching bus arrivals:', error); // Log the error
        displayError('Failed to fetch bus arrival data. Please try again later.'); // Display an error message
    }
}

// Function to display bus arrival data
function displayArrivals(data) {
    const arrivalsList = document.getElementById('arrivals-list');
    arrivalsList.innerHTML = ''; // Clear previous data

    try {
        const arrivals = data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;

        // Check if there are any arrivals
        if (arrivals && arrivals.length > 0) {
            arrivals.forEach(arrival => {
                // Extract relevant information
                const lineName = arrival.MonitoredVehicleJourney.LineRef?.value || 'Unknown Line';
                const destination = arrival.MonitoredVehicleJourney.DestinationName?.[0]?.value || 'Unknown Destination';
                const expectedDepartureTime = arrival.MonitoredVehicleJourney.MonitoredCall?.ExpectedDepartureTime;

                // Create a list item for each arrival
                const listItem = document.createElement('li');

                if (expectedDepartureTime) {
                    const expectedDeparture = new Date(expectedDepartureTime);
                    const minutesUntilDeparture = Math.floor((expectedDeparture - new Date()) / 60000); // Calculate minutes until departure
                    listItem.textContent = `Line ${lineName} to ${destination} - Departs in ${minutesUntilDeparture} minutes`;
                } else {
                    // Handle missing expected departure time
                    listItem.textContent = `Line ${lineName} to ${destination} - Departure time not available`;
                }

                arrivalsList.appendChild(listItem);
            });
        } else {
            // Display a message if no arrivals are found
            const listItem = document.createElement('li');
            listItem.textContent = 'No upcoming departures.';
            arrivalsList.appendChild(listItem);
        }
    } catch (error) {
        console.error('Error displaying arrivals:', error); // Log the error
        displayError('Failed to process bus arrival data.'); // Display an error message
    }
}

// Function to display an error message
function displayError(message) {
    const arrivalsList = document.getElementById('arrivals-list');
    arrivalsList.innerHTML = ''; // Clear previous data
    const listItem = document.createElement('li');
    listItem.textContent = message;
    arrivalsList.appendChild(listItem);
}

// Fetch data immediately when the page loads
fetchBusArrivals();

// Fetch data every 30 seconds to keep it updated
setInterval(fetchBusArrivals, 30000);