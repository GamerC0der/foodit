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
        const delay = Math.random() * 500 + 700;
        setTimeout(() => {
            window.location.href = '/app/setup';
        }, delay);
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

    <button class="rectangle-btn" id="next-btn" style="display: none;">
        <span class="get-started-text">Next</span>
    </button>

    <script>
        async function getLocationByIP() {
            try {
                const response = await fetch('http://ip-api.com/json/');
                const data = await response.json();
                return data.city || data.regionName || 'Unknown Location';
            } catch (error) {
                return 'Location Detection Failed';
            }
        }

        async function detectLocation() {
            const status = document.getElementById('location-status');
            status.textContent = 'Detecting location...';

            const cityName = await getLocationByIP();
            status.textContent = cityName;
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
