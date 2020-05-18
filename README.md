This is similar to [Madge](https://github.com/pahen/madge) --
except that this shows dependencies between the packages
in a [monorepo](https://en.wikipedia.org/wiki/Monorepo) --
not between the modules within a package.

It therefore parses the `dependencies` in the several `package.json` files --
instead of parsing `import` statements in source code.

This implementation is actually unrelated to Madge -- except for its name i.e. "`madge-packages`" -- it has a different author.

For an example of the diagrams which this tool creates,
see [this README](https://github.com/cwellsx/view/tree/master/packages#readme)
-- those diagrams are created by [this batch file](https://github.com/cwellsx/view/blob/master/show-dependencies.bat).
