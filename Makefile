HYPHENATION = hyphenation/english.js hyphenation/hyphenator.js 
JUSTIFICATION = justification/browser-assist.js justification/formatter.js justification/linebreak.js
BASE = base/object.js base/array.js base/linked-list.js 

h-and-j.js: $(HYPHENATION) $(JUSTIFICATION)
	cat $(BASE) $(HYPHENATION) $(JUSTIFICATION) > h-and-j.js
	# cat $(BASE) $(HYPHENATION) $(JUSTIFICATION) | uglifyjs > h-and-j.js
