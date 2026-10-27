# TestProjects

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.1.

## Setup

Use Node.js 24.22.1 and npm 11.21.1 for this project. Angular 22 requires
Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`; Node.js 20 is not supported.
If you also work on older Angular projects, use a version manager to switch
Node versions per project. A temporary toolchain also works without changing
your machine's global Node installation:

```powershell
npx --yes --package=node@24.22.1 --package=npm@11.21.1 -c "npm ci"
npx --yes --package=node@24.22.1 --package=npm@11.21.1 -c "npm start"
```

Commit `package-lock.json` when dependencies change, and use `npm ci` to install
the locked versions. Use `npm install` when updating dependencies.

With Node 24 already active in your terminal, install npm 11.21.1 for that
Node version, then run `npm ci`. Switch to a compatible Node version when you
work on another Angular project.

If npm 10 fails with `Cannot read properties of null (reading 'edgesOut')`,
upgrade npm as above. This is a dependency-resolver crash; `--force` does not
fix it and cannot make Node.js 20 compatible with Angular 22.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
