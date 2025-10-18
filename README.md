# Focus time tracker

## Table of contents
* [Idea](#idea)
* [Features](#features)
* [Technologies](#technologies)
* [Local Development](#local-development)

## Idea
Both Pomodoro and Flowtime techniques offer unique advantages. Sometimes, one is necessary, and other times, the other is preferred. Flowtime allows for long, uninterrupted work sessions, but too much sitting isn't good. On the other hand, strict adherence to Pomodoro intervals may feel limiting. Combining these methods can yield significant benefits. Additionally, presenting this hybrid approach with maximum simplicity and providing useful statistics is essential.

## Features
...

## Technologies
- Java 21
- Angular
- PostgreSQL
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
