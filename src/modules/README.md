# Feature modules

Each feature lives in its own folder with a consistent layout:

```
src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── dto/
└── entities/
```

Keep features self-contained. Cross-cutting code belongs in `src/common`, shared
configuration in `src/config`, and the database client in `src/database`.

Register new feature modules in `src/app.module.ts`. Business routes are served
under the global `/api` prefix; opt a route out of JWT auth with `@Public()`.
