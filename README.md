# Cursoquiz: maintenance guide

This is an Angular single-page application. It contains training courses made of screens that the project calls “slides”. This guide is for routine content updates by someone who does not work as a developer.

## Before changing anything

1. Make a backup of the project folder and, before deploying, a backup of the current site on the host.
2. Install Node.js if it is not already installed. Use the current Node.js LTS version.
3. From the project folder, install the dependencies once:

	```powershell
	npm install
	```

4. Start a local preview:

	```powershell
	npm start
	```

	Open `http://localhost:4200/`. The browser refreshes as files are changed. Stop the server with `Ctrl+C`.

The project is large and has historical naming inconsistencies. Do not rename route paths or component folders just to make their names more consistent; existing links may depend on them.

## The important folders

| Location | What it contains |
| --- | --- |
| `src/assets/` | Images, audio, PDFs, and other files copied to the website. |
| `src/app/component/` | Most course screens and admin screens. |
| `src/app/app-routing.module.ts` | The order and URL of screens (“slides”). |
| `src/app/app.module.ts` | The list of components known to the application. |
| `src/environments/` | API address used by the application. Do not change this for normal image or slide updates. |
| `dist/cursoquiz/` | The production website created by the build command. Upload this folder’s contents to the host. |

## Change an image

1. Put the new image inside `src/assets/`. It is best to use a simple filename with no spaces, accents, or special characters, for example `evacuation-sign.png`.
2. Find the screen that displays the old image. Search the project for the old filename. In VS Code, use `Ctrl+Shift+F`.
3. Replace only the filename in the image reference. Prefer this format:

	```html
	<img src="assets/maqueta11/evacuation-sign.png" alt="Evacuation sign">
	```

	Existing screens use several older path styles, so copy the surrounding style if the image is already working. Do not delete the old file until the local preview has been checked.
4. Check the image at `http://localhost:4200/` and at the relevant course screen. A broken image usually means the filename, capitalization, or folder path does not exactly match.

### Uploading a new asset to the host

Adding a file to the source project does not update the live website by itself. After building the project, the new file will appear under `dist/cursoquiz/assets/`. Upload that file to the matching `assets` folder in the host’s file manager, or upload the complete contents of `dist/cursoquiz/` as described in [Deploy the website](#deploy-the-website).

Keep the same folder structure in both places. For example:

```text
Project:  src/assets/maqueta11/evacuation-sign.png
Build:    dist/cursoquiz/assets/maqueta11/evacuation-sign.png
Host:     public_html/assets/maqueta11/evacuation-sign.png
```

## Change the order of slides

The route list in `src/app/app-routing.module.ts` controls the screen shown for each step. A course normally has a parent route and child routes named `one`, `two`, `three`, and so on. For example, inside the `curso5` route:

```ts
{
  path: 'three',
  component: Curso5pp1Component,
  data: { animationState: '3' }
},
```

To replace the third screen with another existing screen:

1. Find the course section in `src/app/app-routing.module.ts`, such as `path: 'curso5'`.
2. Find the numbered child route, such as `path: 'three'`.
3. Change only its `component:` value to the component that should appear there.
4. Keep `path: 'three'` unchanged. Keep `data.animationState` as the step number unless there is a specific reason to change the transition animation.
5. Preview the course locally and click both the previous and next buttons. Course navigation is sometimes implemented in the parent course component, so changing a route alone may not change every button or progress calculation.

### Important: changing the number of slides

If you add or remove slides, changing `app-routing.module.ts` alone is not enough. Each course parent component also has navigation bookkeeping. For example, the parent for `curso1.2` is `src/app/component/curso1.2/curso1.2.component.ts`.

Check and update all of these items together:

1. The child routes in `src/app/app-routing.module.ts` (`one`, `two`, `three`, and so on).
2. `maxpage` in the parent course component. This is the final slide number. For example, `maxpage = 11` means the Next button leaves the course after slide 11.
3. The `switch` cases in `Previous()`. There must be a case for every slide that can be visited backwards.
4. The `switch` cases in `Next()`. There must be a case for every slide that can be visited forwards.
5. Any progress indicator, completion check, or parent template that displays the number of slides.

For a new slide 12, the route and navigation code must agree:

```ts
// app-routing.module.ts
{
	path: 'twelve',
	component: NewScreenComponent,
	data: { animationState: '12' }
}

// curso1.2.component.ts
maxpage = 12;

// Add this case to BOTH Previous() and Next().
case 12:
	this.routeToChild('twelve');
	break;
```

When inserting a slide in the middle, renumber the later route names and cases consistently, or use the existing route names and deliberately change only their component assignments. Do not leave a route reachable from `app-routing.module.ts` but missing from a `Previous()` or `Next()` switch. Always test the first slide, the last slide, the new slide, previous, next, and the button that returns to the module menu.

## Add a new screen/component

Run these commands from the project root. Replace `new-screen` with a short folder and component name:

```powershell
ng generate component component/new-screen
```

Because `angular.json` is configured for SCSS, this creates:

```text
src/app/component/new-screen/
  new-screen.component.ts
  new-screen.component.html
  new-screen.component.scss
  new-screen.component.spec.ts
```

The Angular CLI normally adds the new component to `src/app/app.module.ts`. Confirm that it appears in the `declarations` list. If it does not, add the import at the top and the component name to `declarations` manually. Do not add a component to `imports` unless it is a standalone component; the components in this project are declared in `AppModule`.

To show the new screen in a course, make both changes below:

1. Import the component in `src/app/app-routing.module.ts`:

	```ts
	import { NewScreenComponent } from './component/new-screen/new-screen.component';
	```

2. Add it to the appropriate course’s `children` list:

	```ts
	{
	  path: 'new-step',
	  component: NewScreenComponent,
	  data: { animationState: '4' }
	},
	```

The parent course component must contain a router outlet for child screens to appear. Existing course components already provide this, so use an existing course as the model. If the new screen is not part of a course, add it as a top-level route in the same routing file.

## Build and deploy the website

1. Test the change locally.
2. Create a production build:

	```powershell
	npm run build
	```

3. The deployable files are in `dist/cursoquiz/`. Upload the **contents** of that folder to the website’s document root, commonly called `public_html`, `httpdocs`, or `www` in a hosting file manager. Do not upload only `src/` and do not leave the files inside an extra `dist/cursoquiz/` URL folder unless that is intentional.
4. Preserve the generated folder structure, especially `assets/`. Replace the old files only after making a backup.
5. Open the live site in a private/incognito browser window and test the changed screen, its images, navigation, and a direct refresh of a nested course URL.

The host must serve `index.html` when a visitor refreshes an Angular route. Use the configuration for the web server provided by the host.

### Apache hosting (`.htaccess`)

Create a file named `.htaccess` in the same document root as `index.html`:

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

If the app is installed in a subfolder, ask the host whether `RewriteBase` or the rule needs that subfolder name. Some hosts disable Apache rewrite rules; contact the host if this file has no effect.

### Nginx hosting

The equivalent must be added to the site’s Nginx server configuration by the hosting provider or server administrator:

```nginx
location / {
	 try_files $uri $uri/ /index.html;
}
```

Do not upload an Nginx configuration file into `public_html`; it must be enabled in the server configuration and Nginx must be reloaded.

## Useful commands

```powershell
npm start       # local development server
npm run build   # production files in dist/cursoquiz/
npm test        # unit tests in a browser window
```

The project uses Angular 17 packages and an older Angular CLI entry in `package.json`. Avoid upgrading Angular, the CLI, or other dependencies as part of a content update. Dependency upgrades are a separate maintenance task and can change the build or deployment behavior.

## If something goes wrong

- **A new image is broken:** check the exact filename and capitalization, then confirm the file exists under `src/assets/` and, after a build, under `dist/cursoquiz/assets/`.
- **A new component is unknown:** confirm its import and that it is listed in `declarations` in `src/app/app.module.ts`.
- **A route shows a blank page:** confirm the component is imported in `app-routing.module.ts`, declared in `app.module.ts`, and placed inside the correct parent route’s `children` list.
- **The live site works at `/` but fails after refreshing a course URL:** configure the Apache or Nginx fallback above.
- **The old image still appears:** hard-refresh the browser (`Ctrl+F5`) or clear the site cache. Production builds use hashed JavaScript and CSS filenames, but image URLs keep their names.
