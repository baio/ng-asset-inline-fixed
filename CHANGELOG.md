# v1.1.7

Bugfixes:
* Order of `styleUrls` are now preserved when inlining to `styles`
* Fixed an error when trying to inline empty `.scss` file

# v1.1.6

Bugfixes:
* Removed console logs from CLI error/success
* CLI errors now causes program to use exit code 1

# v1.1.5

Bugfixes:
* Fixed a bug while inlining in `.metadata.json` files

# v1.1.4

First official release version! 🎉
(Feel free to ignore the previous failed CI attempts.) 🙄

Highlights:
* Supports AOT and JIT modes (inlines `templateUrl` and `styleUrls` for `.js` files and `.metadata.json`)
* Currently handles `.css` and `.scss` for styles, and `.html` for templates
* Has support for `includeStylePaths`for additional style folders (mirrors ng-cli functionality)

Gotchas:
* Currently components file names must have the suffix `.component.js` to be inlined
* All paths supplied to `ng-asset-inline` are relative to command line working directory
