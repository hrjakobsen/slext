# SLext

## To install
### Chrome

Download from [Chrome webstore](https://chrome.google.com/webstore/detail/slext/jlajbdlfgkklpjdgnhajdohfjbihming?hl=en) or install from source.

To install from source, clone the repository:

```bash
git clone git@github.com:hrjakobsen/slext.git
cd slext
gulp pack --vendor=chrome --production
```

Then in Chrome, go to [chrome://extensions](chrome://extensions)

Drag the packed chrome extension from the 'packages' folder onto the page to install the extension.

### Firefox
Clone repository
```bash
git clone git@github.com:hrjakobsen/slext.git
cd slext
gulp pack --vendor=firefox --production
```
Then in Firefox, go to [about:addons](about:addons)

Click on the settings and press 'Install Add-on From File' then select the .xpi file in the packages folder.

# Development
The extension is developed for Google Chrome. If you wish to ensure that everything works in other browsers as well, great! But the following section described the development process in Chrome, so you will have to modify some of the steps to develop for other browsers.

## Install dependencies
```bash
$ npm install
```
## Testing

Run `$ gulp --watch` and load the `dist`-directory into Chrome as an unpacked extension on [chrome://extensions](chrome://extensions). After making changes to the code it will automatically be compiled, but you need to refresh the extension where you loaded it.

## Tasks

### Build

    $ gulp


| Option         | Description                                                                                                                                           |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--watch`      | Starts a livereload server and watches all assets.                       |
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







