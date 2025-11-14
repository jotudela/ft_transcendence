# 🚀 INTRODUCTION

The `ft_transcendence` is the capstone of 42’s Common Core, challenging students to design a secure, full-stack web application from scratch.

It covers the entire development lifecycle—front-end, back-end, database management, real-time features, and security—using modern technologies and frameworks.

Beyond technical skills, the project emphasizes clean architecture, scalability, teamwork, and real-world software practices.

More than a technical milestone, `ft_transcendence` reflects the 42 ethos: innovation, self-learning, and readiness for the evolving tech landscape.

![](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

# 🛠️  Program Specificities and Considerations
---

### 🧠 BACKEND

- Framework: Built with `Fastify` and `Node.js`.
- Microservices: The backend is **modularized as microservices**, making it easy to scale and maintain.
- Database: Powered by `SQLite`, we have databse and its **API** in one container for better scalability and and maintain.
- API: Severals API for each container for each services, that expose database for frontend.
- Infra: It must build all the projet with one command and all microservice is launched in containers with `Docker`.
---

### 🖼️ FRONTEND

- Language: Built with `Typesrcipt` as base code.
- Framework: The hamonization of our project is built in `Tailwind CSS`.
- SPA: That part, ensure user experience, because the website doesn't refresh itself all the time, when click on button or others.
- Comptability: It must work with the latests version of your web browsers for example `Google`, `Mozila`, `Firefox` or `Safari`.
---

### 🔒 SECURITY

- JWT Authentication: All connection are linked to **JWT Token**.
- OAuth 2.0: Implement Google auth, for connect your Google account.
- Two Factor Authentication: Integrated 2FA with the app `Authenticator` from Google, wich enchence security.
---

### 🎮 GAME & TOURNAMENTS

- Classic PONG: You can play (localy only) the basic Pong game !
- Tournament: You can create/participate in tournament (localy only).
- AI: You can play versus a **BOT** wich have different level:
  - easy: this bot is very nervous and returns the ball not often.
  - medium: this bot is better, wich can resturns the ball much more often.
  - hard: this bot is really difficult, wich can predict the ball will land with the bounces !
- Game Mode: When youre not log, you can play with **4 players** ! and you have **2 balls** !
- Game Customization: In the background in a game, you can change the color (blue, red, green).
---

### 👥 USER MANAGEMENT and STATS

- Profile: You can see your information and modify in **Settings**.
- Stats: You have two differents Tabs for stats:
  - `Global Stats`: see your wins, losts and all your **points** from your first game to the last game.
  - `Match History`: see all your match, only loged 1vs1 and 1vs1 in tournaments.
---

### ✨ ALL MODULES

| Number | Name |
| :---:  | :---:|
|1| Major module: Use a framework to build the backend. |
|2| Minor module: Use a framework or a toolkit to build the frontend. |
|3| Minor module: Use a database for the backend. |
|4| Major module: Store the score of a tournament in the Blockchain. |
|5| Major module: Standard user management, authentication, users across tournaments. |
|6| Major module: Implementing a remote authentication. |
|7| Major module: Multiplayer (more than 2 players in the same game). |
|8| Minor module: Game customization options. |
|9| Major module: Introduce an AI opponent. |
|10| Major module: Implement Two-Factor Authentication (2FA) and JWT. |
|11| Major module: Designing the backend as microservices. |
|12| Minor module: Support on all devices. |
|13| Minor module: Expanding browser compatibility. |

> [!NOTE]
> `Minor modules`: 5% or 1 points for bonus in more (two minor count as one major).
>
> `Major modules`: 10% or 2 points for bonus in more.
---

### 🔧 GLOBAL TECH STACK:

- Backend: Typescript, Fastify, Node.js, API, NGINX, Docker
- Frontend: Typescript, HTML, Tailwind CSS
- Auth & Security: JWT, 2FA with Authenticator, OAuth 2.0 (Google)
- Orchestration: Docker compose

My final grade :

![](imgs/120_percent.png)

![](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

### 👨‍💻 Authors

- Arnaud Fontan ([@afontan](https://github.com/arnaudfontan)): Responssible of the frontend and game.
- [@ReIVen](https://github.com/ReivenIV): Responssible of the Database and Backend.
- Joan Tudela ([@Jolinkan](https://github.com/jotudela)): Responssible of all infrastructure, Backend, Blockchain management and settings in frontend.
