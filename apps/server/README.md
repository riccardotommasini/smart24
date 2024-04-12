# Server

## Installation and execution

1. Install dependencies

    ```bash
    npm ci
    ```

2. Setup environment:

    - Using Docker: No setup required. Refer to root README for more information.

    - Using local environment:
        1. Copy the `.env` template file.

            ```bash
            cp .env.example .env
            ```
        
        2. Update the `.env` file with the required values.

        3. Start the dependencies:
        
            3.1. Go to each packages in the `packages` directory.

            3.2. Follow the instructions.

        3. Start the server.

            ```bash
            npm run dev
            ```

## File Structure

```
server/
├── src/
│   ├── config/
│   │   └── registry.ts                 # Create dependency injection registries
│   ├── constants/
│   │   └── symbols.ts
│   ├── controllers/
│   │   ├── abstract-controller.ts      # Abstract controller class
│   │   ├── [...]-controller/
│   │   │   ├── [...]-controller.ts     # Controller classes
│   │   ╵   └── [...]-controller.test.ts# Controller test classes
│   ├── middlewares/
│   │   └── error-handler.ts            # Error handler middleware
│   ├── models/
│   │   └── http-exception.ts           # HTTP exception class
│   ├── services/
│   │   ├── [...]-service/
│   │   │   ├── [...]-service.ts        # Service classes
│   │   ╵   └── [...]-service.test.ts   # Service test classes
│   ├── utils/
│   │   └── env.ts                      # Environment variables
│   ├── app.ts                          # Express application
│   └── index.ts                        # Entry point
├── package.json                        # NPM package configuration
└── tsconfig.json                       # TypeScript configuration
```