coverage:
	rm -rf coverage
	istanbul cover node_modules/.bin/_mocha

lint:
	eslint --reset .

publish:
	webpack ./
	uglifyjs dist/markdown-it-imsize.js > dist/markdown-it-imsize.min.js

test: lint
	mocha

test-ci:
	istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

.PHONY: lint coverage
.SILENT: lint
