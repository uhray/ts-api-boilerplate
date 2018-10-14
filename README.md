Uhray Typescript API Boilerplate
===============

The Uhray Boilerplate is a starting point for API development with Typescript. 

## Features

* Hosted using [expressjs](http://expressjs.com), pre-configured with some [middleware](http://expressjs.com/4x/api.html#middleware).
* API ready to be built using [crud](https://github.com/uhray/crud.git).
* Built ready for [heroku](https://heroku.com) deployment.
* Easily extendable to new modules [npm](http://npmjs.org)
* Ready for [mongodb](http://www.mongodb.org/) connectivity via [mongoosejs](http://mongoosejs.com/).

## Quick Start

Dependencies:
* [node](http://nodejs.org/)
* [npm](https://www.npmjs.org/) (now comes with node)
* [bower](http://bower.io/)
* [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started)
* [sass](http://sass-lang.com/) - `gem install sass`
* [foreman](https://github.com/ddollar/foreman)

```
git clone git@github.com:uhray/ts-api-boilerplate.git
cd ts-api-boilerplate
npm install
SECRET=thisSecret npm start
// Application is now running at http://localhost:5000
```

## Documentation

Take a look at the [Uhray Boilerplate Docs](doc/boilerplate.md). This documentation is bundled with the project, which makes it readily available for offline viewing and provides a useful starting point for any documentation you want to write about your api;
