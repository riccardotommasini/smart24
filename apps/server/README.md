# Server

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