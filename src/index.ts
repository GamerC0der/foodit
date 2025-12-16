import { Hono } from "hono"
import { createWish, deleteWish, fulfillWish, listWishes } from "./db/queries"

const app = new Hono()

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
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #FF4B3A;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 25vh;
        }

        .food-for-thought {
            font-family: 'SF Pro Rounded';
            font-style: normal;
            font-weight: 800;
            font-size: 65px;
            line-height: 86.84%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            text-align: center;
        }

        .rectangle-btn {
            position: absolute;
            width: 314px;
            height: 70px;
            left: 50%;
            transform: translateX(-50%);
            bottom: 50px;
            background: #FFFFFF;
            border-radius: 30px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .get-started-text {
            font-family: 'SF Pro Text';
            font-style: normal;
            font-weight: 600;
            font-size: 17px;
            line-height: 20px;
            color: #FF460A;
            pointer-events: none;
        }

        .burger-image {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            max-width: 300px;
            max-height: 300px;
            transition: transform 0.3s ease;
        }

        .burger-image:hover {
            transform: translate(-50%, -60%);
        }

        .hotdog-image {
            position: absolute;
            left: 40%;
            top: 60%;
            transform: translate(-50%, -50%);
            max-width: 200px;
            max-height: 200px;
            transition: transform 0.3s ease;
        }

        .hotdog-image:hover {
            transform: translate(-50%, -60%);
        }

        .pizza-image {
            position: absolute;
            left: 60%;
            top: 60%;
            transform: translate(-50%, -50%);
            max-width: 200px;
            max-height: 200px;
            transition: transform 0.3s ease;
        }

        .pizza-image:hover {
            transform: translate(-50%, -60%);
        }
    </style>
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
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #FF4B3A;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .loader {
            width: 50px;
            height: 50px;
            border: 5px solid #ffffff;
            border-top: 5px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
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
    <style>
        body {
            background-color: #FF4B3A;
            min-height: 100vh;
        }

        input[type="checkbox"] {
            position: relative;
            appearance: none;
        }

        .meal-option.selected {
            background: #FFFFFF !important;
            color: #FF460A;
        }

        .meal-option.selected span {
            color: #FF460A;
        }

        .rectangle-btn {
            position: absolute;
            width: 314px;
            height: 70px;
            left: 50%;
            transform: translateX(-50%);
            bottom: 50px;
            background: #FFFFFF;
            border-radius: 30px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .get-started-text {
            font-family: 'SF Pro Text';
            font-style: normal;
            font-weight: 600;
            font-size: 17px;
            line-height: 20px;
            color: #FF460A;
            pointer-events: none;
        }

        .setup-text {
            font-family: 'SF Pro Rounded';
            font-style: normal;
            font-weight: 800;
            font-size: 65px;
            line-height: 86.84%;
            letter-spacing: -0.03em;
            color: #FFFFFF;
            text-align: center;
            margin-bottom: 40px;
        }

        .meals-text {
            font-family: 'SF Pro Text';
            font-style: normal;
            font-weight: 600;
            font-size: 18px;
            color: #FFFFFF;
        }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen">
    <div class="setup-text">Setup</div>

    <div class="flex flex-col items-center gap-6">
        <div class="meals-text">Meals</div>

        <div class="flex flex-col gap-4">
            <div class="meal-option flex items-center justify-center p-12 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30 transition-all" data-meal="lunch">
                <span class="text-white font-medium text-4xl">Lunch</span>
            </div>
            <div class="meal-option flex items-center justify-center p-12 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30 transition-all" data-meal="dinner">
                <span class="text-white font-medium text-4xl">Dinner</span>
            </div>
        </div>
    </div>

    <button class="rectangle-btn">
        <span class="get-started-text">Next</span>
    </button>

    <script>
        document.querySelectorAll('.meal-option').forEach(option => {
            option.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
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
