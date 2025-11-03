# Command driven focus tracker

## Table of contents
* [Idea](#idea)
* [Features](#features)
* [Screenshots](#screenshots)
* [Technologies](#technologies)
* [Local Development](#local-development)

## Idea
Both Pomodoro and Flowtime techniques offer unique advantages. Sometimes, one is necessary, and other times, the other is preferred. Flowtime allows for long, uninterrupted work sessions, but too much sitting isn't good. On the other hand, strict adherence to Pomodoro intervals may feel limiting. Combining these methods can yield significant benefits. Additionally, presenting this hybrid approach with maximum simplicity and providing useful statistics is essential.

## Features
### Current features
* Login / Logout
* Command-based control – most actions can be done using simple commands
* Custom timers – for example, set your session or break lengths however you want
* Session control – start, pause, take short or long breaks
* Auto-break mode – automatically selects the correct break type after each focus session
* Session overview – view completed and unfinished sessions

### Planned features
* Full command support – perform all actions via commands
* Stopwatch mode
* Statistics

## Screenshots
<img width="2533" height="1244" alt="image" src="https://github.com/user-attachments/assets/cd13fdfd-f388-4fce-b7e4-821359b5b3ad" />
<img width="2512" height="1255" alt="image" src="https://github.com/user-attachments/assets/d94a632f-f075-496a-802c-318596de77fa" />
<img width="2542" height="1248" alt="image" src="https://github.com/user-attachments/assets/f0444f64-c56f-4f46-bc08-d2f994674e0c" />
<img width="2541" height="1263" alt="image" src="https://github.com/user-attachments/assets/c549d523-76a6-4e51-8600-1a57a2e28727" />


## Technologies
- Java 21
- Spring Boot 3
- Gradle
- PostgreSQL
- Angular 18
- Tailwind CSS

## Local Development
### Environment
1. Create a `./local-dev/.env` file with the following example values:
    ```
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=focus-time-tracker
    POSTGRES_PORT=5432
    PORT=5000
    SPRING_PROFILES_ACTIVE=dev
    ```
2. Run configuration `local-dev` and it should use `.env` file automatically.

Configuration `local-dev` will launch:
1. PostgreSQL database
2. Development Proxy
3. In dev setup you have one account created: admin/admin

### Frontend
#### Before coding frontend
1. Set prettier if "Automatic Prettier configuration" not working, use this path `/focus-time-tracker-v2/ui/node_modules/prettier`""
2. Set "Run for files" `**/*.{js,ts,jsx,tsx,cjs,cts,mjs,mts,vue,astro,html}`

#### Running the Local Frontend
1. Run `npm install`
2. Run configuration `start front`

### Backend
#### Running the Local Backend with IntelliJ
1. Run configuration `start backend`
