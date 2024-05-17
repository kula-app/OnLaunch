![OnLaunch](https://github.com/kula-app/OnLaunch/blob/main/res/github_header.png)

# OnLaunch

OnLaunch is a service that allows app developers to notify app users about updates, warnings, and maintenance. Our open-source framework provides a server and easy-to-integrate clients for Swift, Kotlin, and Flutter to communicate with the backend and display the user interface. You can self-host the server or let us do the work for you!

After an initial implementation of OnLaunch into your app, no more development tasks are needed. Due to our intuitive GUI, little to no technological knowledge is needed to create and manage messages that are displayed within the apps:

![OnLaunch example](https://github.com/kula-app/OnLaunch/blob/main/res/OnLaunch_example_screenshot.png)

# Getting Started

See the [Documentation Overview](/docs/index.md) for detailed documentation.

## Quick Start

First, you have to meet these requirements.

### Prerequisites

- Node.js
- Docker
- Yarn (_recommended_)

## Setup

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

To see how check out our client repos:

- [Android Client](https://github.com/kula-app/OnLaunch-Android-Client)
- [iOS Client](https://github.com/kula-app/OnLaunch-iOS-Client)
- [Flutter Client](https://github.com/kula-app/OnLaunch-Flutter-Client)

## Local Deployment

1. Start the next.js server

```bash
yarn dev
```

2. Start docker resources

```bash
docker-compose up
```

This will start a Postgres and a Mailhog instance.

3. Run Prisma Studio

```bash
yarn prisma studio
```

With Prisma Studio you can easily inspect the data within your database.

## Contributing Guide

Please see our [Contributing Guide](https://github.com/kula-app/OnLaunch/blob/main/CONTRIBUTING.md).

## Technologies Used

- [Next.js](https://nextjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma.io](https://www.prisma.io/)
- [Docker](https://www.docker.com/)

## License

Distributed under the [Apache 2.0 License](https://github.com/kula-app/OnLaunch/blob/main/LICENSE).

## Acknowledgement

We want to thank [netidee](https://www.netidee.at/) for partly funding our project!
