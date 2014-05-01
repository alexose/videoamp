# Via http://wonko.com/post/simple-makefile-to-minify-css-and-js

# Patterns matching CSS files that should be minified. Files with a -min.css
# suffix will be ignored.
CSS_FILES = $(filter-out %-min.css,$(wildcard \
	public/css/*.css \
	public/css/**/*.css \
))

# Patterns matching JS files that should be minified. Files with a -min.js
# suffix will be ignored.
JS_FILES = $(filter-out %-min.js,$(wildcard \
	public/js/*.js \
	public/js/**/*.js \
))

all : scripts.js scripts.min.js

scripts.js : ${JS_FILES}
	@echo '==> Concatinating $^'
	cat > $@ $^
	@echo

scripts.min.js : scripts.js
	@echo '==> Minifying $^'
	yuicompressor --charset utf-8 --type js $^ > $@
	@echo

# target: clean - Removes minified CSS and JS files.
clean:
	rm -f scripts.js scripts.min.js

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile
