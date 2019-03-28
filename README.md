# UA-ACM-Student-Chapter.github.io

## Documentation
https://ua-acm-student-chapter.github.io/docs/backend_docs.html

## Use it for your student organization
__Deployment Guide__

https://ua-acm-student-chapter.github.io/docs/deployment_guide.html

## About
**What the heck is this for?**

* This is our website! It contains the kind of information most professional student organizations would have.

**Through what sorcery is this achieved?**

* There are quite a few resources we used, which are all open source, to implement our site:
  * Bootstrap 4: https://github.com/twbs/bootstrap
    * Adds great looking layouts and elements
  * jQuery 3.3.1: https://github.com/jquery/jquery
    * Makes doing cool stuff to the DOM in Javascript easy
  * Fontello: https://github.com/fontello/fontello
    * Lets you use custom icons without downloading all of Font Awesome
  * Braintree Payments: https://github.com/braintree
    * They provide an easy way to do PCI compliant payments
  * FormatGoogleCalendar: https://github.com/MilanLund/FormatGoogleCalendar
    * Defeats Google Calendar's ugly, ugly old blue embeddable iframe widget
  * Javascript Obfuscator: https://github.com/javascript-obfuscator/javascript-obfuscator/
    * Makes the scripts tiny

## Automated Minification

You can use PostCSS and UglifyJS Grunt tasks to automatically minify the `style.css` and `acm-1.0.1.js` files before pushing commits.

To do this, start by installing [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com), the Node.js package manager, which is included in current releases of Node by default. You can download a Node.js installer for your platfrom from [their website](https://nodejs.org/en/download/).

Next, install all of the required dependencies by running the following command in the root directory of the project:

```shell
npm install -g grunt
npm install
```

Now all you need to do is run the `grunt` command in the root directory of the project whenever you are ready to minify, and the `style.css` and `acm-1.0.1.js` files will be automatically minified!
