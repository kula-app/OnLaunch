![OnLaunch](https://github.com/kula-app/OnLaunch/blob/main/public/github_header.png)

# OnLaunch

OnLaunch is a service allowing app developers to notify app users about updates, warnings and maintenance. Our open-source framework provides a server and two easy-to-integrate clients to communicate with the backend and display the user interface. You can self-host the server or let us do the work for you!

## Technologies Used

- [Next.js](https://nextjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma.io](https://www.prisma.io/)
- [Docker](https://www.docker.com/)

## Getting Started

First, you have to meet these requirements.

### Prerequisites

- Node.js (Version >= 20.11.x)
- Docker
- Yarn (_recommended_)

## Setup

### Self-hosted

1. Clone the repo

```bash
git clone https://github.com/kula-app/OnLaunch.git
```

2. Go to the project folder

3. Install packages

```bash
yarn install
```

4. Set up your `.env` file

Create a copy of the `.env.example` file and name the new one `.env`

The most notable parameters are:
- `DATABASE_URL`: Set the connection string to the postgres database.
- `REDIS_XXX`: Set the data for the Redis instance or sentinels.
- `SIGNUPS_ENABLED`: If set to false, no further sign ups are possible.

5. Integrate OnLaunch into your mobile apps

To see how, check out our client repos:

- [Android Client](https://github.com/kula-app/OnLaunch-Android-Client)
- [iOS Client](https://github.com/kula-app/OnLaunch-iOS-Client)

### Hosted by us

You can easily get started by signing up on our platform: [OnLaunch by kula](https://onlaunch.kula.app/)

## Local Deployment

1. Start the next.js server

```bash
yarn dev
```

2. Start docker resources

```bash
docker-compose up
```

This will start a Postgres, a Redis and a Mailhog instance.

3. Run Prisma Studio

```bash
yarn prisma studio
```

With Prisma Studio you can easily inspect the data within your database.

### Visual Studio Code

For Visual Studio Code we are providing predefined launch configurations:
- `Start Server`: Runs `yarn dev` to start the server locally on port 3000
- `Start Resources`: Runs `docker-compose up` that starts instances for postgres, redis and mailhog.
- `Start Prisma Studio`: Runs `yarn prisma studio` to start a prisma studio instance.
- `Develop`: Runs all three of the above configurations.

## Models overiew

The most prominent models to use are:
- Organsation
- App
- Message

### Organisation

An organisation consists of a name and apps. Users can join an organisation by invitation of a user with admin rights within the organisation.

### App

An app consists of a name and a public key. The public key is used to integrate OnLaunch into the mobile clients (refer to the respective GitHub repository listed bellow for more information).

### Message

A message consists of a title, body, blocking flag, start date, end date and actions. The blocking flag indicates whether the message can be easily dismissed within the mobile clients, which is used in combination with actions. The start and end date define the timespan of the message being displayed within mobile clients. Note: The end date has to be after the start date. Actions offer the user receiving the message on their mobile client options on how to interact with the message.

Example message: If you want to schedule maintenance work, you can do so by providing a title and body with the scheduled start and end date of the maintenance. Set blocking to true and do not offer any actions. This will prevent the user of the mobile client to use it any further until the end date of the message is reached.

## API endpoints

We distinguish between three different API endpoints:
- Admin API
- Frontend API
- Client API

### Admin API

The Admin API is used for server-to-server communication. This makes it easy for you to let your server communicate with OnLaunch. 

We distinguish between organisation and app admin tokens. Both can be created via the GUI. The organisation admin tokens do not expire, but for the app admin tokens a lifespan can be set on creation.

With an organisation admin token you can gather all information about the organisation (e.g. the name) and the apps contained by it. You can also create a temporary app admin token for an app, if you wish to apply a short task on the app without having to save the information about the app admin token for a longer period.

With an app admin token you can gather all information about the app (e.g. the name or public key) and the messages contained by it. The messages can be viewed, edited and new ones created.

### Frontend API

The Frontend API is used by the frontend provided by OnLaunch.

### Client API

The Client API is used to retrieve all messages to display within the mobile clients from the OnLaunch server.

### OpenAPI integration

For the Admin and Client API the documentation can be viewed and tested under `/api-doc`.

#### Note:
For testing some endpoint methods you need to be logged in or provide the bearer token. This requires signing up first, which can be done via the GUI.

## Testing

To run the test suites use the command `yarn test` in the root directory.

## Contributing Guide

Please see our [Contributing Guide](https://github.com/kula-app/OnLaunch/blob/main/CONTRIBUTING.md).

## License

Distributed under the [Apache 2.0 License](https://github.com/kula-app/OnLaunch/blob/main/LICENSE).
