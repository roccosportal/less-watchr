less-watchr
===========

a simple file watcher for less files

## Installation

```
npm install -g less-watchr
``` 

## Usage

### Example 1

```
folder/
		style.less
``` 


```
less-watchr --path folder/style.less
``` 

Listens at the `folder/style.less` file and recompiles it when changes occur. Creates/updates the file `folder/style.css`.

### Example 2

```
folder/
		style.less
		style2.less
``` 

```
less-watchr --path folder
``` 

Listens at the `folder` folder and recompile the .less when changes occur. Creates/updates the file `folder/style.css` or  `folder/style2.css`.


### Example 3

```
folder/
		one.less
		two.less
		style.less
``` 

```
less-watchr --path folder --fileToCompile folder/style.less
``` 

Listens at the `folder` folder and recompiles only the style.less after changes made at any .less file. Creates/updates the file `folder/style.css`.
This is usefull when style.less is your main entry and uses @import.

### Example 4


```
folder/
		folder1/
			one.less
			two.less
			style.less
		folder2/
			one.less
			two.less
			style.less

``` 

```
less-watchr --config less-watchr-config.json
``` 

less-watchr-config.json

``` javascript
{
    "path" : "folder",
    "outputFilename" : "$1.css",
    "fileToCompileMap" : [
	      {
	          "path": "folder/folder1/",
	          "fileToCompile" : "folder/folder1/style.less"
	      },
	      {
	          "path": "folder/folder2",
	          "fileToCompile" : "folder/folder2/style.less"
	      }
    ]
}
``` 

Listens at the `folder` folder and recompiles `folder/folder1/style.less` when changes in `folder/folder1` occur. Same for `folder/folder2`.
This is usefull you have different sections in one folder but still only want to use one less-watchr process.

### Example 5

```
folder/
		folder1/
			one.less
			two.less
			style.less
		folder2/
			one.less
			two.less
			style.less
		global/
			mixins.less

``` 

```
less-watchr --config less-watchr-config.json
``` 

less-watchr-config.json

``` javascript
{
    "path" : "folder",
    "outputFilename" : "$1.css",
    "fileToCompileMap" : [
          {
              "path": "folder/folder1/",
              "fileToCompile" : "folder/folder1/style.less"
          },
          {
              "path": "folder/folder2",
              "fileToCompile" : "folder/folder2/style.less"
          },
          {
              "path": "folder/global",
              "fileToCompile" : [
              	"folder/folder1/style.less",
              	"folder/folder2/style.less"
              ]
          }
    ]
}
```

If something in folder `folder/global` is changed it recompiles `folder/folder1/style.less` and `folder/folder2/style.less`.


## Additional Features

### Path as array

Option `path` can be an array.

```
less-watchr --path folder1 -path folder2
``` 
or
``` javascript
{
    "path" : ["folder1", "folder2"],
}
```

### outputFilename

You can define the ouput file name of the lessc compiler.
`$1` will be replaced with the .less name.

```
less-watchr --outputFilename "$1.less.css"
```

or

```
less-watchr --outputFilename "hello.css"
``` 

now, if you want to set another path for outputfile, the path must be relative to the .less file location:

```
folder/
		css/
			style.css
		folder1/
			style.less
			other.less

``` 

```
less-watchr --path folder/folder1/styles.less --outputFilename ../css/styles.css
``` 

Same in the config file.

### options

With the `options` you can pass options to the lessc compiler.

```
--options="--yui-compress"
``` 

*Notice the __=__ when you this argument*

