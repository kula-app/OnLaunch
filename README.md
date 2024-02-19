![OnLaunch](https://github.com/kula-app/OnLaunch/blob/main/public/github_header.png)

# OnLaunch

OnLaunch is a service allowing app developers to notify app users about updates, warnings and maintenance. Our open-source framework provides an easy-to-integrate client to communicate with the backend and display the user interface.

## Technologies Used

- [Next.js](https://nextjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma.io](https://www.prisma.io/)
- [Docker](https://www.docker.com/)

## Getting Started

First, you have to meet these requirements.

### Prerequisites

- Node.js
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

5. Integrate OnLaunch into your mobile apps

To see how, check out our client repos:

- [Android Client](https://github.com/kula-app/OnLaunch-Android-Client)
- [iOS Client](https://github.com/kula-app/OnLaunch-iOS-Client)

### Alternative - OnLaunch SaaS

You can easily get started by signing up on our SaaS-platform: [OnLaunch by kula](https://onlaunch.kula.app/)

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

### OpenAPI integration

Certain endpoint documentation can be viewed and tested under `/api-doc`.

#### Note:
For testing some endpoints you need to be logged in or provide the bearer token. This requires signing up first.

## Contributing Guide

Please see our [Contributing Guide](https://github.com/kula-app/OnLaunch/blob/main/CONTRIBUTING.md).

## License

Distributed under the [Apache 2.0 License](https://github.com/kula-app/OnLaunch/blob/main/LICENSE).
