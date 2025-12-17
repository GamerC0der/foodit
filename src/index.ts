import { Hono } from "hono"
import { createWish, deleteWish, fulfillWish, listWishes, createPlace, deletePlace, listPlaces } from "./db/queries"

const app = new Hono()

function getClientIP(c: any): string {
  const forwarded = c.req.header('x-forwarded-for')
  const realIP = c.req.header('x-real-ip')
  const cfConnectingIP = c.req.header('cf-connecting-ip')

  return forwarded?.split(',')[0]?.trim() ||
         realIP ||
         cfConnectingIP ||
         c.req.header('remote-addr') ||
         '127.0.0.1'
}

app.get('/style.css', async (c) => {
  const css = await Bun.file('./style.css')
  return c.body(await css.arrayBuffer(), {
    headers: {
      'Content-Type': 'text/css',
    },
  })
})

app.get('/burger.png', async (c) => {
  const image = await Bun.file('./burger.png')
  return c.body(await image.arrayBuffer(), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
})

app.get('/hotdog.png', async (c) => {
  const image = await Bun.file('./hotdog.png')
  return c.body(await image.arrayBuffer(), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
})

app.get('/pizza.png', async (c) => {
  const image = await Bun.file('./pizza.png')
  return c.body(await image.arrayBuffer(), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
})

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Food for Thought</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="food-for-thought">Food for<br>Thought</div>
    <img src="/burger.png" alt="Burger" class="burger-image">
    <img src="/hotdog.png" alt="Hotdog" class="hotdog-image">
    <img src="/pizza.png" alt="Pizza" class="pizza-image">
    <button class="rectangle-btn" onclick="window.location.href='/app'">
        <span class="get-started-text">Get Started</span>
    </button>
</body>
</html>`)
})

app.get('/app', (c) => {
  const redirect = c.req.query('redirect');
  const targetUrl = redirect === '1' ? '/app/1' : '/app/setup';
  const delay = redirect === '1' ? 1500 : Math.random() * 500 + 700;

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="loader"></div>
    <script>
        setTimeout(() => {
            window.location.href = '${targetUrl}';
        }, ${delay});
    </script>
</body>
</html>`)
})

app.get('/app/setup', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/style.css">
</head>
<body class="flex flex-col items-center min-h-screen">
    <div class="setup-text">Setup</div>

    <div class="meal-selector">
        <div class="flex flex-col gap-4">
            <div class="meal-option flex items-center justify-center p-12 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30 transition-all" data-meal="lunch">
                <span class="text-white font-medium text-4xl">Lunch</span>
            </div>
            <div class="meal-option flex items-center justify-center p-12 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30 transition-all" data-meal="dinner">
                <span class="text-white font-medium text-4xl">Dinner</span>
            </div>
        </div>
    </div>

    <button class="rectangle-btn" onclick="window.location.href='/app/location'">
        <span class="get-started-text">Next</span>
    </button>

    <div class="notification" id="selection-notification" onclick="dismissNotification()">
        Tap Lunch or Dinner to select them.
    </div>

    <script>
        let notificationTimeout;
        let autoDismissTimeout;

        function showNotification() {
            const notification = document.getElementById('selection-notification');
            notification.classList.add('show');
            autoDismissTimeout = setTimeout(() => {
                dismissNotification();
            }, 25000);
        }

        function dismissNotification() {
            const notification = document.getElementById('selection-notification');
            notification.classList.add('fade-out');
            clearTimeout(autoDismissTimeout);
            setTimeout(() => {
                notification.classList.remove('show', 'fade-out');
            }, 300);
        }

        notificationTimeout = setTimeout(() => {
            showNotification();
        }, 5000);

        document.querySelectorAll('.meal-option').forEach(option => {
            option.addEventListener('click', function() {
                this.classList.toggle('selected');
                clearTimeout(notificationTimeout);
            });
        });
    </script>
</body>
</html>`)
})

app.get('/app/location', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Location</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/style.css">
</head>
<body class="flex flex-col items-center min-h-screen">
    <div class="setup-text">Location</div>

    <div class="location-permission">
        <div class="location-text">Share your location to find food nearby</div>
        <div class="location-status" id="location-status">Detecting location...</div>
    </div>

    <button class="rectangle-btn" id="next-btn" style="display: none;" onclick="window.location.href='/app?redirect=1'">
        <span class="get-started-text">Next</span>
    </button>
    <script>
        async function getLocationByIP() {
            try {
                const response = await fetch('http://ip-api.com/json/');
                const data = await response.json();
                return { city: data.city || data.regionName || 'Unknown Location', lat: data.lat, lon: data.lon };
            } catch (error) {
                return { city: 'Location Detection Failed', lat: null, lon: null };
            }
        }

        async function detectLocation() {
            const status = document.getElementById('location-status');
            status.textContent = 'Detecting location...';

            const locationData = await getLocationByIP();
            status.textContent = locationData.city;
            status.classList.add('success');


            document.getElementById('next-btn').style.display = 'flex';
        }

        window.addEventListener('load', function() {
            detectLocation();
        });
    </script>
</body>
</html>`)
})

app.get('/app/1', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Food for Thought</title>
    <link rel="stylesheet" href="/style.css">
    <link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.css' rel='stylesheet' />
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js'></script>
    <style>
        body {
            font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .app-container {
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-right: 2px solid rgba(255, 255, 255, 0.3);
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        .restaurant-search {
            margin-bottom: 20px;
        }
        .restaurant-search input {
            width: 80%;
            padding: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 16px;
            backdrop-filter: blur(10px);
        }
        .restaurant-search input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        .restaurant-search input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.2);
        }
        .restaurant-list {
            flex: 1;
            overflow-y: auto;
            margin-top: 20px;
        }
        .restaurant-item {
            padding: 12px;
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .restaurant-item:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
        }
        .restaurant-item.selected {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
        }
        .restaurant-name {
            font-weight: 600;
            color: white;
            font-size: 16px;
            margin-bottom: 4px;
        }
        .restaurant-type {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
        }
        .restaurant-rating {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 4px;
        }
        .saved-place-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .place-info {
            flex: 1;
        }
        .remove-btn {
            background: rgba(255, 0, 0, 0.2);
            border: 1px solid rgba(255, 0, 0, 0.3);
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            margin-left: 10px;
            flex-shrink: 0;
        }
        .remove-btn:hover {
            background: rgba(255, 0, 0, 0.4);
        }
        .select-food {
            font-family: 'SF Pro Rounded';
            font-style: normal;
            font-weight: 800;
            font-size: 32px;
            line-height: 86.84%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            margin-bottom: 20px;
        }
        .main-content {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        #calendar {
            max-width: 900px;
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        .fc-header-toolbar {
            margin-bottom: 1em !important;
        }
        .fc-button {
            background: rgba(255, 255, 255, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            color: white !important;
        }
        .fc-button:hover {
            background: rgba(255, 255, 255, 0.3) !important;
        }
        .fc-today-button {
            background: rgba(255, 255, 255, 0.4) !important;
        }
        .fc-daygrid-day:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .fc-toolbar-title {
            color: white !important;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="sidebar">
            <div class="select-food">Select Food</div>
            <div class="restaurant-search">
                <input type="text" id="restaurant-search" placeholder="Search restaurants...">
            </div>
            <div class="restaurant-list" id="restaurant-list">
            </div>

            <div class="saved-places-section" style="margin-top: 30px;">
                <div style="font-size: 18px; font-weight: 600; color: white; margin-bottom: 15px;">Selected Places</div>
                <div class="saved-places-list" id="saved-places-list">
                </div>
            </div>
        </div>
        <div class="main-content">
            <div id='calendar'></div>
        </div>
    </div>
    <script>
        let restaurants = [];
        let selectedRestaurant = null;
        let calendar;

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        async function searchPlaces(query = '') {
            try {
                const url = '/api/places/search?q=' + encodeURIComponent(query);
                const response = await fetch(url);
                const data = await response.json();

                if (data.error) {
                    console.error('Search error:', data.error);
                    return [];
                }

                if (data.suggestions.length === 0) {
                    console.log('Empty suggestions response:', data);
                }

                return data.suggestions.map((suggestion, index) => ({
                    id: index + 1,
                    name: suggestion.title,
                    subtitle: suggestion.subtitle,
                    type: suggestion.type,
                    query: suggestion.query,
                    thumbnail: suggestion.thumbnail,
                    rating: 'N/A',
                    price: 'N/A',
                    latitude: suggestion.latitude,
                    longitude: suggestion.longitude,
                    placeId: suggestion.placeId
                }));
            } catch (error) {
                console.error('Search error:', error);
                return [];
            }
        }

        function displayRestaurants(restaurantsToShow) {
            const restaurantList = document.getElementById('restaurant-list');
            restaurantList.innerHTML = '';

            restaurantsToShow.forEach(restaurant => {
                const restaurantItem = document.createElement('div');
                restaurantItem.className = 'restaurant-item';
                if (selectedRestaurant && selectedRestaurant.id === restaurant.id) {
                    restaurantItem.className += ' selected';
                }
                restaurantItem.onclick = () => selectRestaurant(restaurant);

                restaurantItem.innerHTML =
                    '<div class="restaurant-name">' + restaurant.name + '</div>' +
                    '<div class="restaurant-type">' + (restaurant.subtitle || restaurant.type) + '</div>' +
                    '<div class="restaurant-rating">' +
                        (restaurant.rating !== 'N/A' ? '⭐ ' + restaurant.rating : '') +
                        (restaurant.price !== 'N/A' ? ' • ' + restaurant.price : '') +
                    '</div>';

                restaurantList.appendChild(restaurantItem);
            });
        }

        async function selectRestaurant(restaurant) {
            if (selectedRestaurant && selectedRestaurant.id === restaurant.id) {
                selectedRestaurant = null;
                displayRestaurants(restaurants);

                try {
                    const savedPlaces = await fetch('/api/places').then(r => r.json());
                    const placeToRemove = savedPlaces.find(p =>
                        p.title === restaurant.name &&
                        p.subtitle === restaurant.subtitle
                    );
                    if (placeToRemove) {
                        await fetch('/api/places/' + placeToRemove.id, {
                            method: 'DELETE'
                        });
                        loadSavedPlaces();
                    }
                } catch (error) {
                    console.error('Error removing place:', error);
                }
                return;
            }

            selectedRestaurant = restaurant;
            displayRestaurants(restaurants);

            try {
                const response = await fetch('/api/places', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: restaurant.name,
                        subtitle: restaurant.subtitle,
                        type: restaurant.type,
                        query: restaurant.query,
                        thumbnail: restaurant.thumbnail,
                        latitude: restaurant.latitude,
                        longitude: restaurant.longitude,
                        placeId: restaurant.placeId
                    })
                });

                if (response.ok) {
                    loadSavedPlaces();
                    if (calendar) {
                        calendar.refetchEvents();
                    }
                }
            } catch (error) {
            }
        }

        async function removePlace(placeId) {
            try {
                const response = await fetch('/api/places/' + placeId, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadSavedPlaces();
                    if (calendar) {
                        calendar.refetchEvents();
                    }
                } else {
                    console.error('Failed to remove place');
                }
            } catch (error) {
                console.error('Error removing place:', error);
            }
        }

        async function loadSavedPlaces() {
            try {
                const response = await fetch('/api/places');
                const savedPlaces = await response.json();

                const savedPlacesList = document.getElementById('saved-places-list');
                savedPlacesList.innerHTML = '';

                if (savedPlaces.length === 0) {
                    savedPlacesList.innerHTML = '<div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">No places selected yet</div>';
                    return;
                }

                savedPlaces.forEach(place => {
                    const placeItem = document.createElement('div');
                    placeItem.className = 'restaurant-item saved-place-item';
                    placeItem.innerHTML =
                        '<div class="place-info">' +
                            '<div class="restaurant-name">' + place.title + '</div>' +
                            '<div class="restaurant-type">' + (place.subtitle || place.type) + '</div>' +
                        '</div>' +
                        '<button class="remove-btn" onclick="removePlace(' + JSON.stringify(place.id) + ')">✕</button>';
                    savedPlacesList.appendChild(placeItem);
                });
            } catch (error) {
                console.error('Error loading saved places:', error);
            }
        }


        async function handleSearch() {
            const searchInput = document.getElementById('restaurant-search');
            const searchTerm = searchInput.value.trim();

            if (searchTerm.length === 0) {
                restaurants = await searchPlaces();
                displayRestaurants(restaurants);
                return;
            }

            if (searchTerm.length < 2) {
                return;
            }

            restaurants = await searchPlaces(searchTerm);
            displayRestaurants(restaurants);
        }

        document.addEventListener('DOMContentLoaded', async function() {
            restaurants = await searchPlaces();

            const searchInput = document.getElementById('restaurant-search');
            searchInput.addEventListener('input', debounce(handleSearch, 300));

            displayRestaurants(restaurants);
            loadSavedPlaces();

            var calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                height: 'auto',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                },
                dayMaxEvents: true,
                moreLinkClick: 'popover',
                events: async function(fetchInfo, successCallback, failureCallback) {
                    try {
                        const response = await fetch('/api/events');
                        const events = await response.json();
                        successCallback(events);
                    } catch (error) {
                        console.error('Error loading events:', error);
                        failureCallback(error);
                    }
                }
            });
            calendar.render();
        });
    </script>
</body>
</html>`)
})

async function getLocationByIP() {
  try {
    const response = await fetch('http://ip-api.com/json/');
    const data = await response.json();
    return {
      city: data.city || data.regionName || 'Unknown Location',
      lat: data.lat,
      lon: data.lon,
      region: data.regionName,
      country: data.country
    };
  } catch (error) {
    return { city: 'Mission Viejo, CA', lat: null, lon: null, region: 'CA', country: 'US' };
  }
}

app.get("/api/places/search", async (c) => {
  const prefix = c.req.query('q') || ''
  if (!prefix.trim()) {
    return c.json({ suggestions: [] })
  }

  try {
    const locationData = await getLocationByIP()
    const location = locationData.city ? (locationData.city + ', ' + (locationData.region || '')).trim() : 'Mission Viejo, CA'

    const query = encodeURIComponent(prefix.trim());
    const pb = '\u00212i13\u00214m12\u00211m3\u00211d21197.432321416414\u00212d-117.7255936\u00213d33.691785749999994\u00212m3\u00211f0\u00212f0\u00213f0\u00213m2\u00211i2005\u00212i1226\u00214f13.1\u00217i20\u002110b1\u002112m25\u00211m5\u002118b1\u002130b1\u002131m1\u00211b1\u002134e1\u00212m4\u00215m1\u00216e2\u002120e3\u002139b1\u002110b1\u002112b1\u002113b1\u002116b1\u002117m1\u00213e1\u002120m3\u00215e2\u00216b1\u002114b1\u002146m1\u00211b0\u002196b1\u002199b1\u002119m4\u00212m3\u00211i360\u00212i120\u00214i8\u002120m57\u00212m2\u00211i203\u00212i100\u00213m2\u00212i4\u00215b1\u00216m6\u00211m2\u00211i86\u00212i86\u00211m2\u00211i408\u00212i240\u00217m33\u00211m3\u00211e1\u00212b0\u00213e3\u00211m3\u00211e2\u00212b1\u00213e2\u00211m3\u00211e2\u00212b0\u00213e3\u00211m3\u00211e8\u00212b0\u00213e3\u00211m3\u00211e10\u00212b0\u00213e3\u00211m3\u00211e10\u00212b1\u00213e2\u00211m3\u00211e10\u00212b0\u00213e4\u00211m3\u00211e9\u00212b1\u00213e2\u00212b1\u00219b0\u002115m8\u00211m7\u00211m2\u00211m1\u00211e2\u00212m2\u00211i195\u00212i195\u00213i20\u002122m3\u00211s0e5BaeHAJoKdwbkPub-g-Qw\u00217e81\u002117s0e5BaeHAJoKdwbkPub-g-Qw%3A67\u002123m2\u00214b1\u002110b1\u002124m109\u00211m30\u002113m9\u00212b1\u00213b1\u00214b1\u00216i1\u00218b1\u00219b1\u002114b1\u002120b1\u002125b1\u002118m19\u00213b1\u00214b1\u00215b1\u00216b1\u00219b1\u002113b1\u002114b1\u002117b1\u002120b1\u002121b1\u002122b1\u002127m1\u00211b0\u002128b0\u002132b1\u002133m1\u00211b1\u002134b1\u002136e2\u002110m1\u00218e3\u002111m1\u00213e1\u002114m1\u00213b0\u002117b1\u002120m2\u00211e3\u00211e6\u002124b1\u002125b1\u002126b1\u002127b1\u002129b1\u002130m1\u00212b1\u002136b1\u002137b1\u002139m3\u00212m2\u00212i1\u00213i1\u002143b1\u002152b1\u002154m1\u00211b1\u002155b1\u002156m1\u00211b1\u002161m2\u00211m1\u00211e1\u002165m5\u00213m4\u00211m3\u00211m2\u00211i224\u00212i298\u002172m22\u00211m8\u00212b1\u00215b1\u00217b1\u002112m4\u00211b1\u00212b1\u00214m1\u00211e1\u00214b1\u00218m10\u00211m6\u00214m1\u00211e1\u00214m1\u00211e3\u00214m1\u00211e4\u00213sother_user_google_review_posts__and__hotel_and_vr_partner_review_posts\u00216m1\u00211e1\u00219b1\u002189b1\u002198m3\u00211b1\u00212b1\u00213b1\u0021103b1\u0021113b1\u0021114m3\u00211b1\u00212m1\u00211b1\u0021117b1\u0021122m1\u00211b1\u0021126b1\u0021127b1\u002126m4\u00212m3\u00211i80\u00212i92\u00214i8\u002134m19\u00212b1\u00213b1\u00214b1\u00216b1\u00218m6\u00211b1\u00213b1\u00214b1\u00215b1\u00216b1\u00217b1\u00219b1\u002112b1\u002114b1\u002120b1\u002123b1\u002125b1\u002126b1\u002131b1\u002137m1\u00211e81\u002147m0\u002149m10\u00213b1\u00216m2\u00211b1\u00212b1\u00217m2\u00211e3\u00212b1\u00218b1\u00219b1\u002110e2\u002161b1\u002167m5\u00217b1\u002110b1\u002114b1\u002115m1\u00211b0\u002169i761'

    const url = 'https://www.google.com/s?tbm=map&gs_ri=maps&suggest=p&authuser=0&hl=en&gl=us&psi=0e5BaeHAJoKdwbkPub-g-Qw.1765928662643.1&q=' + query + '&ech=13&pb=' + encodeURIComponent(pb)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'AEC=AaJma5sVOoaFMQzegcPdkKnohO_lORQPd4PzlWe5y60pSABLcqeBNZ1IFj8; __Secure-BUCKET=CEc; __Secure-STRP=AD6Dogsc_9MJ7r3Z_dSD3_7vQ6RfhKQhdIwt15_bKmoDow4MyTWUdjFHA_Yb7BKeg_Wl6zasE5HnEDEVZbrMNN2Q86La7UPQFHaJ; NID=527=tqP1-J4TYy3MkdTqw2-utnykEVxwofukWvhti4t3IVmvvxzKUDbEnkzFPu0mbwiqLNbUNfSWrBwDffBzy1u_XVplgnwDX3SA6756qsmN24NYzJdAS8IXxu6mdvHf9p3p04ZM93el3Lk8h1HVQPVdwTVcFWo8wO7AIX3ku4zGCDXwp9W75NmAuSpKbqZI6feDBjkRp49THsLEkqK_zpc368lzwS39-SV9SCWoxRE',
        'downlink': '10',
        'priority': 'u=1, i',
        'referer': 'https://www.google.com/',
        'rtt': '100',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-arch': 'x86',
        'sec-ch-ua-bitness': '64',
        'sec-ch-ua-full-version-list': '"Google Chrome";v="143.0.0.0", "Chromium";v="143.0.0.0", "Not A(Brand";v="24.0.0.0"',
        'sec-ch-ua-model': '""',
        'sec-ch-device-memory': '8',
        'sec-ch-ua-platform-version': '14.5.0',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'x-browser-channel': 'stable',
        'x-browser-copyright': 'Copyright 2025 Google LLC. All Rights reserved.',
        'x-browser-validation': 'AUXUCdutEJ+6gl6bYtz7E2kgIT4=',
        'x-browser-year': '2025',
        'x-client-data': 'CKy1yQEIh7bJAQiitskBCKmdygEIlfjKAQiVocsBCIagzQEIlozPAQjLkc8BCLWizwEI1aPPAQiTpM8BCJOlzwEImqXPARjshc8BGLKGzwEY76LPAQ==',
        'x-maps-diversion-context-bin': 'CAE='
      }
    })

    if (!response.ok) {
      throw new Error('Google Maps API error: ' + response.status)
    }

    const text = await response.text()

    try {
      const timestamp = Date.now();
      const filename = `google_response_${timestamp}.json`;
      const filepath = `./logs/${filename}`;
      await Bun.write(filepath, JSON.stringify({
        query: prefix.trim(),
        location: location,
        rawResponse: text,
        timestamp: new Date().toISOString()
      }, null, 2));
    } catch (logError) {
      console.error('Failed to save API response log:', logError);
    }

    let jsonText = text;
    if (text.startsWith(')]}\'')) {
      jsonText = text.substring(4);
    }

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      console.error('Raw response text:', text);
      throw new Error('Failed to parse Google Maps response');
    }

    const suggestions = [];

    if (Array.isArray(data) && data.length > 0) {
      const businessArrays = data[0]?.[1] || []

      for (const businessArray of businessArrays) {
        if (businessArray && businessArray[22]) {
          const businessInfo = businessArray[22]

          const fullName = Array.isArray(businessInfo[0]) ? businessInfo[0][0] : businessInfo[0] || 'Unknown'
          const address = Array.isArray(businessInfo[2]) ? businessInfo[2][0] : businessInfo[2] || ''
          const coords = businessInfo[10]
          const placeId = businessInfo[26] || businessInfo[27] || ''

          const name = typeof fullName === 'string' ? fullName.split(',')[0].trim() : 'Unknown'

          const hasAddress = address && address.length > 0
          const hasCoords = coords && typeof coords[2] === 'number' && typeof coords[3] === 'number'
          const isSeeLocations = address === 'See locations' || (Array.isArray(address) && address[0] === 'See locations')

          if (fullName && (hasAddress || hasCoords) && !isSeeLocations) {
            suggestions.push({
              title: name,
              subtitle: address,
              type: 'business',
              query: fullName,
              thumbnail: null,
              latitude: coords?.[2] || null,
              longitude: coords?.[3] || null,
              placeId: placeId
            });
          }
        }
      }
    }

    const responseData = { suggestions, location };

    try {
      const timestamp = Date.now();
      const filename = `parsed_response_${timestamp}.json`;
      const filepath = `./logs/${filename}`;
      await Bun.write(filepath, JSON.stringify(responseData, null, 2));
    } catch (logError) {
      console.error('Failed to save parsed response log:', logError);
    }

    return c.json(responseData);

  } catch (error) {
    console.error('Search error:', error);

    const errorResponse = { error: 'Failed to search places', suggestions: [], details: error instanceof Error ? error.message : String(error) };

    try {
      const timestamp = Date.now();
      const filename = `error_${timestamp}.json`;
      const filepath = `./logs/${filename}`;
      await Bun.write(filepath, JSON.stringify(errorResponse, null, 2));
    } catch (logError) {
      console.error('Failed to save error log:', logError);
    }

    return c.json(errorResponse, 500);
  }
})

app.get("/api/places", (c) => {
  const ipAddress = getClientIP(c)
  return c.json(listPlaces(ipAddress))
})

app.post("/api/places", async (c) => {
  const body = await c.req.json().catch(() => null)
  const { title, subtitle, type, query, thumbnail, latitude, longitude, placeId } = body || {}
  const ipAddress = getClientIP(c)

  if (!title || !type || !query) {
    return c.json({ error: "title, type, and query are required" }, 400)
  }

  return c.json(createPlace(title, subtitle, type, query, thumbnail, latitude, longitude, placeId, ipAddress), 201)
})

app.delete("/api/places/:id", (c) => {
  const id = Number(c.req.param("id"))
  const ipAddress = getClientIP(c)
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = deletePlace(id, ipAddress)
  if (res.changes === 0) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

app.get("/api/events", (c) => {
  const ipAddress = getClientIP(c)
  const savedPlaces = listPlaces(ipAddress)

  if (savedPlaces.length === 0) {
    return c.json([])
  }

  const events = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)

  const endDate = new Date(today)
  endDate.setFullYear(today.getFullYear() + 1)

  let previousPlaceIndex = -1

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0]
    const seed = dateString.split('-').reduce((acc, part) => acc + parseInt(part), 0)

    let placeIndex = Math.floor(seededRandom(seed) * savedPlaces.length)

    if (placeIndex === previousPlaceIndex && savedPlaces.length > 1) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const newIndex = Math.floor(seededRandom(seed + attempt + 1) * savedPlaces.length)
        if (newIndex !== previousPlaceIndex) {
          placeIndex = newIndex
          break
        }
      }
    }

    const selectedPlace = savedPlaces[placeIndex]
    previousPlaceIndex = placeIndex

    events.push({
      id: `event-${dateString}`,
      title: selectedPlace.title,
      start: dateString,
      allDay: true,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      textColor: 'white'
    })
  }

  return c.json(events)
})

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

app.get("/api/wishes", (c) => {
  const ipAddress = getClientIP(c)
  return c.json(listWishes(ipAddress))
})

app.post("/api/wishes", async (c) => {
  const body = await c.req.json().catch(() => null)
  const item = (body?.item ?? "").toString().trim()
  const ipAddress = getClientIP(c)
  if (!item) return c.json({ error: "item is required" }, 400)

  return c.json(createWish(item, ipAddress), 201)
})

app.patch("/api/wishes/:id/fulfill", (c) => {
  const id = Number(c.req.param("id"))
  const ipAddress = getClientIP(c)
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = fulfillWish(id, ipAddress)
  if (res.changes === 0) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

app.delete("/api/wishes/:id", (c) => {
  const id = Number(c.req.param("id"))
  const ipAddress = getClientIP(c)
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = deleteWish(id, ipAddress)
  if (res.changes === 0) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})


export default app
