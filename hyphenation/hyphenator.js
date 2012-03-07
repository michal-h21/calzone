Hyphenator = function() {
    var addPattern = function(h, p) {
        var chars = p.split("").filter(function(x) { return x.match(/\D/) });
        var points = p.split(/\D/).map(function(x) { return parseInt(x) || 0 });
        var t = h.trie;
        chars.map(function(x) {
            if (!t[x]) { t[x] = {} };
            t = t[x];
        });
        t["_"] = points;
    };
    var loadPatterns = function(h, languageset) {
        if(!languageset) languageset = HyphenatorEnglish;
        languageset.patterns.forEach(function(p) { addPattern(h, p) });
        languageset.exceptions.forEach(function(x) { 
            h.exceptions[x.replace(/-/g,"")] = [ 0 ].append(x.split(/[^-]/).map(function(l) { return l == "-" ? 1 : 0}));
        });
    };

    var hyphenate = function(word, delim) {
        if (!delim) delim = "-";
        if (word.length < this.minWord) return [word];
        var points = this.exceptions[word.toLowerCase()];
        word = word.split("");
        if (!points) {
            var work = ["." ].append( word.map(function(s) { return s.toLowerCase() })).append(["."]);
            var points = [0].append(work.map(function(x) { return 0 }));
            for (var i = 0; i < work.length; i++) {
                var t = this.trie;
                for (var j = i;j < work.length; j++) {
                    if (!t[work[j]]) break;
                    t = t[work[j]];
                    var p;
                    if (p = t._) {
                        for (k = 0; k < p.length; k++) {
                            if (points[i+k] < p[k]) {
                                points[i+k] = p[k];
                            }
                        }
                    }
                }
            }
            for (var i= 0; i < this.minPrefix + 1; i++) points[i] = 0;
            for (var i= points.length; i > points.length-this.maxPrefix; i--) points[i] = 0;
        }
        var pieces = [''];
        var i;
        for (i =0; i < word.length; i++) {
            pieces[pieces.length-1] = pieces[pieces.length-1] + word[i];
            if (points[2+i] % 2) { pieces.push("") }
        }
        return pieces;
    };
    return function (patterns, exceptions) {
        this.minWord = 5; this.minPrefix = 2; this.minPrefix = 2;
        this.trie = {};
        this.exceptions = {};
        this.hyphenate = hyphenate;
        loadPatterns(this, patterns, exceptions);
    return this;
    }
}();

