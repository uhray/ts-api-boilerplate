# UHRAY TS API BOILERPLATE DOCS

**Intro**
* [Quick Start](#quick-start)
* [Codebase Organization](#codebase-organization)

**Backend Docs**
* [Server Configuration](#server-configuration)
* [API](#api)
* [Shells](#shells)

<br>
# INTRO


## Quick Start

Dependencies:
* [node](http://nodejs.org/)
* [npm](https://www.npmjs.org/) (now comes with node)

```bash
git clone git@github.com:uhray/ts-api-boilerplate.git
cd ts-api-boilerplate
npm install
SECRET=mySecret npm start
# Application is now running at http://localhost:5000
```

The application will by default try to connect to the MongoDB at mongodb://localhost/test. If you do not have a database running there, the API will not work. If you wish to change the location, see [Server Configuration](#server-configuration).

If you want to see your api docs, run `gulp swagger`.


## Codebase Organization

The Uhray Boilerplate [root directory](https://github.com/uhray/ts-api-boilerplate) contains many files and directories related to the application server, configurations, build commands, etc. We'll get into many of these specifics later. The primary file of importance is [server.ts](../server.ts) which is the application server. The real meat of the Uhray Boilerplate is within the [src/api](../src/api) directory.

```
src/
  api/
server.ts
```

#### API Organization

The structure;

```
src/
  api/
    resources/
    index.ts
```
<a href="#backend-org-api" name="backend-org-api">#</a> API

By default, the Uhray Boilerplate is set up for use with a [MongoDB](http://www.mongodb.org/) database and [Mongoose](http://mongoosejs.com/) for database connectivity and querying. It also comes ready for the creation of a REST API built on top of [crud](https://github.com/uhray/crud#backend) and [crud-mongoose](https://github.com/uhray/crud-mongoose), modules developed by Uhray that allow a developer to easily setup database resources for interactivity within the application. Each resource directory establishes the schema, instantiates a model, and defines the API routes for interacting with that resource.

# BACKEND DOCS

## Server Configuration

#### Server Setup

The Uhray Boilerplate was designed for applications running a *Node.js* server with *Express.js* as a web application framework. Everything about the server starts with the [server.ts](../server.ts) file. At a high level, this file is responsible for the execution of several tasks:

 1. Some default [express](http://expressjs.com/4x/api.html#application) app configurations, and middleware.
 1. Configures the API (establishing database connectivity, schemas, API routes to listen for, etc.).

You are free to add, modify, or remove pretty much anything you want from *server.ts* to suit your needs.

#### Setting Config Variables
There are a number of ways to set configuration variables within your application.

In the [loadConfigs](../server.ts) function of *server.ts*, you will see the following code snippet:

```
nconf
    .argv()
    .env()
    .file({ file: __dirname + '/config/settings.tson' });
nconf.set('lib', __dirname + '/app');
nconf.set('PORT', '5000');
nconf.set('HOST', '127.0.0.1');
```

It is important to note that there is a hierarchical precedence for how these variables are set. You must be aware of this ordering to avoid conflicts where variables could be overwritten. Config variables, as defined in the code above, are set in the following order:

 1. Command line arguments (process.argv)
Ex: ``` node server.ts --PORT 9123```
 2. Environment variables (process.env)
Ex: ``` PORT=9123 node server.ts```
 3. JSON file of key value pairs
Ex: ``` { "PORT": 9123 } ```
 4. Variables set directly with nconf
Ex: ``` nconf.set('PORT', '9123')```

This means that command-line arguments will override all other similarly named config variables. Environment variables will be overwritten by command-line arguments but will overwrite everything else. So on and so forth.

**We generally set config variables** by placing them in a `.env` file at the root of the boilerplate. This file will be used by our gulp process to host servers. For example, a file like this may work:

```
PORT=1234
MONGO_URL=mongodb://localhost/test
SECRET=mySecret
```

#### Boilerplate Config Variables

By default, the boilerplate comes with a number of configurations you can use. They are listed below:

  * `MONGO_URL` - Database string for the API. Example: `MONGO_URL=mongodb://localhost/test`
  * `SECRET` - Required to encrypt session variables with who is logged in. Example: `SECRET=MySecret`
  * `cors` - Sets API routes to allow cross-site scripting. Example: `cors=true`
  * `PUBLIC_URL` - Used for many utilities like email functionality to link users back to the public facing URL. Example: `PUBLIC_URL=http://127.0.0.1:5000`
  * `PORT` - Port to launch the server on. Example: `PORT=3000`
  * Email Configs: There are two methods for emailing built into the boilerplate. First, is standard email via SMTP Authentication. The second is via [Postmark](http://postmarkapp.com). By default, we use the standard email tools unless the Postmark configurations are set.

    * `FROM_EMAIL` - To decide the from email address. Example: `FROM_EMAIL=team@uhray.com`.

    * Postmark Configurations

      * `POSTMARK_API_TOKEN` - API token provided by postmark. Example: `POSTMARK_API_TOKEN=fdjas-dfasd-fds-dfs`

## API

#### API Basics

The backend API directory consists of an [index.ts](../src/api/index.ts) file and a directory of [resources](../src/api/resources).

```
api/
  index.ts
  resources/
```

 When *server.ts* is run, it makes a call to [configure the API](../server.ts#L49). This executes the API's *index.ts* file which, by default, does a number of useful things to get applications up and running quickly.

 1. Establishes basic authentication with forgot password functionality for users via [turnkey](https://github.com/uhray/turnkey).
 2. Launches REST API built via [crud](https://github.com/uhray/crud#backend) based on your resources.
 3. Connects to your MongoDB if the [config variable](#config-variables) 'MONGO_URL' is set to the URL where your MongoDB instance is hosted.

#### Resources

In [REST APIs](http://en.wikipedia.org/wiki/Representational_state_transfer), a resource is defined as "an object with a type, associated data, relationships to other resources, and a set of methods that operate on it." Therefore, a resource is basically an *instance* of a [Mongoose Model](http://mongoosejs.com/docs/models.html) which is defined by a [Mongoose Schema](http://mongoosejs.com/docs/guide.html) along with its associated API entities/routes which are defined using [crud](https://github.com/uhray/crud#backend).

As an example from the [users.ts](../src/api/resources/users.ts) resource file, we first define the Mongoose Schema for our users.

```js
Schema = exports.Schema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  username: { type: String, index: true, unique: true },
  info: {
    gender: { type: String, enum: ['M', 'F'] },
    age: Number
  },
  dates: {
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    deleted: { type: Date }
  }
});
```

Next, we create the users model as an instantiation of that mongoose schema.

```js
Model = exports.Model = mongoose.model('users', Schema);
```

Lastly, we define API routes via [crud](https://github.com/uhray/crud#backend) where we also specify what exactly should happen with the resource when performing activities like create (C), read (R), update (U), and delete (D). We quickly discovered that regardless of the API resource, there are many common database operations that were repeatedly performed, especially when creating, reading, updating, or deleting data. For this reason, we created [crud-mongoose](https://github.com/uhray/crud-mongoose) which is middleware that connects crud to mongoose and provides many convenient and configurable calls to save you time and energy.

```js
crud.entity('/users').Create()
  .use(turnkey.createPassword())
  .pipe(cm.createNew(Model));
```

#### Creating a New Resource

To create a new resource, simple create a new JavaScript file in the API's [resources](../src/api/resources) directory. The file will need to define a [Mongoose Schema](http://mongoosejs.com/docs/guide.html), instantiate a [Mongoose Model](http://mongoosejs.com/docs/models.html), and define the [crud](https://github.com/uhray/crud#backend) API calls associated with that resource. If you're just getting started, check out the [users.ts](../src/api/resources/users.ts) resource as an example.

## Shells

#### Basics

When the server receives a request for a particular route, it responds with a rendered shell. A shell is simply a skeleton of static HTML & CSS that is sent to the client-side and immediately displayed before the frontend takes care of loading the remainder of the elements and data into the main body of the page.

The advantage to using shells is that you can update data on the frontend as a user navigates between pages without re-requesting the shell content from the application server or re-rendering the entire view. This creates a smoother user experience without the constant feel of page refreshes. It can also significantly lighten the load on your application server since parts of your HTML template and stylesheets don't need to be repeatedly served. The application server will just respond to API requests after a shell is sent to the frontend (unless you request a new shell for a different part of your web application).

#### Setup

Shells are configured in the [*server.ts*](../server.ts#L68-L77) file. The actual HTML shells are stored in the backend's [shells directory](../app/backend/shells).

By default, the Uhray Boilerplace comes with one shell ([*main.html*](../app/backend/shells/main.html)) that sets up some basic meta tags, links 3 stylesheets, provides a container for the frontend content to be embedded, and loads the frontend JavaScript code.

#### Structure

Take a look at the [main.html](../app/backend/shells/main.html) shell packaged with the boilerplate. It's a basic HTML file and generally you can do whatever you want here. That being said, there are three important concepts to understand:

  * *CSS compiling* - The [gulp build](#build) command joins and minifies all CSS into a single file for faster loads. This is great, but you'll need to tell it what CSS files to include. Example here:

  ```html
  <!-- build:css -->
    <link rel="stylesheet"
          href="/public/bower/normalize.css/normalize.css">
    <link rel="stylesheet"
          href="/public/bower/html5-boilerplate/css/main.css">
    <link rel="stylesheet" href="/public/styles/css/main.css">  
  <!-- endbuild -->
  ```

  * *Inside of Shell* - The shell is a wrapper for the single page application, the context. The context makes up a single inside-part of the shell. This is identified by the div#body tag. Example:

  ```html
  <div id="body">

    <!-- context takes over here -->

  </div>
  ```

  > Note: If you're curious how it knows to insert everyting into the div#body, read on: As mentioned previously, the boilerplate is not supposed to contain magic. The codebase is fully contained in these files and you can technically change and do whatever you want. Each page in a context, see [this one](../app/frontend/contexts/main/pages/home/main.ts) for example, tells the Ractive page where to place to content in the *el* value.

  * *Choosing the context* - The context is chosen by telling the shell which javascript to load. This javascript should contain the code for the full context. By default we have the following line at the bottom of the shell to load the configure.ts file via requirejs:

  ```html
    <script type="text/javascript"
          src="/public/bower/requirejs/require.ts"
          data-main="/public/contexts/{{context}}/configure.ts"></script>
  ```

  It's important to see here, that the context is chosen by the variable `{{context}}` in the shell. This is set in the `server.ts` file, which handles the full server routing. See [here](https://github.com/uhray/ts-api-boilerplate/blob/master/server.ts#L68). You'll need to carefully set which routes of the server (or logic based on logged in or logged out) should load which combination of shell and context.

  It was carefully desiged this way to give the developers full control over the user experience. You may need logic (Is this user logged in? Is it an admin user or a regular user?) or you may need to just route different shells/contexts based on the url requested by the user. It's up to you.

  Each shell can be used for multiple contexts. Example: You have a shell that includes a header and a footer. The context will fit in the middle. You could have a context for whether the user is logged in, which includes the active application, and a context for if the user is logged out, which includes login/sign up/forgot password/etc.

  Each context can be used for multiple shells. We see this as less common, but why restrict it? Example: You may want to wrap a context with completely different css to give a different look and feel depending on the domain (think white labelling).

#### Adding a New Shell

In order to add a new shell, you need to do 2 things:

 1. Create a new HTML template in the backend's [shells](../app/backend/shells) directory. This html file is a template that's computed using [mustache](https://www.npmjs.org/package/mustache-express).
 2. Add a new route in [*server.ts*](../server.ts) that renders the template you created in step 1.

> Note: The server.ts file first configures the API routes which by default will be ```/api/*```. Next, the server configures the routes for shells specified in the [*server.ts*](../server.ts) file. By default, we just have one route ```/*``` that will catch anything that doesn't match the API routes and render the [main.html](../app/backend/shells/main.html) shell. If you add a new shell, you must either define it before our default route, or change our default route  to something that doesn't interfere with your new shell's route.


<br><br>
