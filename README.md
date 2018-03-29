# SLext

## To install
### Chrome

Download from [Chrome webstore](https://chrome.google.com/webstore/detail/slext/jlajbdlfgkklpjdgnhajdohfjbihming?hl=en) or install from source.

To install from source, clone the repository:

```bash
git clone git@github.com:hrjakobsen/slext.git
```
Then in Chrome, go to [chrome://extensions](chrome://extensions)

Click on "Load Unpacked Extension" and choose the sl-optimizr folder

### Firefox
Clone repository
```bash
git clone git@github.com:hrjakobsen/slext.git
```
Then in Firefox, go to [about:config](about:config)

Click on "Load Temporary Add-on" and choose the manifest.json file in the slext folder

To make it persistent, you have to create a Firefox extension on [addons.mozilla.org](https://addons.mozilla.org/en-US/developers/addon/submit/distribution).

# Development

## Install dependencies

	$ npm install

## Usage

Run `$ gulp --watch` and load the `dist`-directory into chrome.

## Entryfiles (bundles)

There are two kinds of entryfiles that create bundles.

1. All ts-files in the root of the `./app/scripts` directory
2. All css-,scss- and less-files in the root of the `./app/styles` directory

## Tasks

### Build

    $ gulp


| Option         | Description                                                                                                                                           |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--watch`      | Starts a livereload server and watches all assets. <br>To reload the extension on change include `livereload.js` in your bundle.                      |
| `--production` | Minifies all assets                                                                                                                                   |
| `--verbose`    | Log additional data to the console.                                                                                                                   |
| `--vendor`     | Compile the extension for different vendors (chrome, firefox, opera, edge)  Default: chrome                                                                 |
| `--sourcemaps` | Force the creation of sourcemaps. Default: !production                                                                                                |


### pack

Zips your `dist` directory and saves it in the `packages` directory.

    $ gulp pack --vendor=chrome

### Version

Increments version number of `manifest.json` and `package.json`,
commits the change to git and adds a git tag.


    $ gulp patch      // => 0.0.X

or

    $ gulp feature    // => 0.X.0

or

    $ gulp release    // => X.0.0







