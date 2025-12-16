import { Hono } from "hono"
import { createWish, deleteWish, fulfillWish, listWishes } from "./db/queries"

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
        </div>
        <div class="main-content">
            <div id='calendar'></div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
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
