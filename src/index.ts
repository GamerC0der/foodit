import { Hono } from "hono"
import { createWish, deleteWish, fulfillWish, listWishes, createPlace, deletePlace, listPlaces } from "./db/queries"

const app = new Hono()

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
            width: 100%;
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

                return data.suggestions.map((suggestion, index) => ({
                    id: index + 1,
                    name: suggestion.title,
                    subtitle: suggestion.subtitle,
                    type: suggestion.type,
                    query: suggestion.query,
                    thumbnail: suggestion.thumbnail,
                    rating: 'N/A',
                    price: 'N/A'
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
                        thumbnail: restaurant.thumbnail
                    })
                });

                if (response.ok) {
                    loadSavedPlaces();
                }
            } catch (error) {
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
                    placeItem.className = 'restaurant-item';
                    placeItem.innerHTML =
                        '<div class="restaurant-name">' + place.title + '</div>' +
                        '<div class="restaurant-type">' + (place.subtitle || place.type) + '</div>';
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
            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                height: 'auto',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                },
                dayMaxEvents: true,
                moreLinkClick: 'popover'
            });
            calendar.render();
        });
    </script>
</body>
</html>`)
})

async function getLocationByIP() {
  try {
    const response = await fetch('http://ip-api.com/json/')
    const data = await response.json()
    return {
      city: data.city || data.regionName || 'Unknown Location',
      lat: data.lat,
      lon: data.lon,
      region: data.regionName,
      country: data.country
    }
  } catch (error) {
    return { city: 'Mission Viejo, CA', lat: null, lon: null, region: 'CA', country: 'US' }
  }
}

app.get("/api/places/search", async (c) => {
  const prefix = c.req.query('q') || ''
  if (!prefix.trim()) {
    return c.json({ suggestions: [] })
  }

  try {
    const locationData = await getLocationByIP()
    const location = locationData.city ? `${locationData.city}, ${locationData.region || ''}`.trim() : 'Mission Viejo, CA'

    const response = await fetch('https://www.yelp.com/gql/batch', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'content-type': 'application/json',
        'origin': 'https://www.yelp.com',
        'referer': 'https://www.yelp.com/',
        'x-apollo-operation-name': 'GetSuggestions',
      },
      body: JSON.stringify([
        {
          operationName: 'GetSuggestions',
          variables: {
            capabilities: [],
            prefix: prefix.trim(),
            location: location
          },
          extensions: {
            operationType: 'query',
            documentId: '109c8a7e92ee9b481268cf55e8e21cc8ce753f8bf6453ad42ca7c1652ea0535f'
          }
        }
      ])
    })

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status}`)
    }

    const data = await response.json()

    const suggestions = data[0]?.data?.searchSuggestFrontend?.prefetchSuggestions?.suggestions || []

    const transformedSuggestions = suggestions
      .filter((suggestion: any) => suggestion.type === 'business')
      .map((suggestion: any) => ({
        title: suggestion.title,
        subtitle: suggestion.subtitle,
        type: suggestion.type,
        query: suggestion.query,
        thumbnail: suggestion.thumbnail?.key || null,
        redirectUrl: suggestion.redirectUrl
      }))

    return c.json({ suggestions: transformedSuggestions, location })

  } catch (error) {
    return c.json({ error: 'Failed to search places', suggestions: [] }, 500)
  }
})

app.get("/api/places", (c) => c.json(listPlaces()))

app.post("/api/places", async (c) => {
  const body = await c.req.json().catch(() => null)
  const { title, subtitle, type, query, thumbnail } = body || {}

  if (!title || !type || !query) {
    return c.json({ error: "title, type, and query are required" }, 400)
  }

  return c.json(createPlace(title, subtitle, type, query, thumbnail), 201)
})

app.delete("/api/places/:id", (c) => {
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = deletePlace(id)
  if (res.changes === 0) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

app.get("/api/wishes", (c) => c.json(listWishes()))

app.post("/api/wishes", async (c) => {
  const body = await c.req.json().catch(() => null)
  const item = (body?.item ?? "").toString().trim()
  if (!item) return c.json({ error: "item is required" }, 400)

  return c.json(createWish(item), 201)
})

app.patch("/api/wishes/:id/fulfill", (c) => {
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = fulfillWish(id)
  if (res.changes === 0) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

app.delete("/api/wishes/:id", (c) => {
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = deleteWish(id)
  if (res.changes === 0) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})


export default app
