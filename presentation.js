(function() {
    var DEBUG = false;
    var NUM_PRELOAD = 2; /* level of preloads, higher means slower initial page load but lower server usage */

    var $loading, $title, $go_prevs, $go_nexts, $prog, $content;

    var baseURL; /* e.g. http://example.com/mypres/ */

    /* from data/index.js */
    var title,
        length;

    /* contains strings w/ HTML from data/{1, 2, 3...}.html, one indexed */
    var contents = [null];
    var loc = 0;

    function FORN(start, end, f) {
        var i;
        LOG("FOR i=" + start + ".." + end);
        for (i=start; i<=end; i++)
            if (f(i))
                break;
    }
    function LADD(max, n1, n2) {
        var r = n1 + n2;
        if (r > max)
            r = max;
        LOG("LADD max of " + n1 + "+" + n2 + ", " + max + " is " + r);
        return r;
    }

    function LOG(msg) {
        if (!DEBUG)
            return;
        if (console.log)
            console.log(msg);
        else
            alert("(no console.log) " + msg);
    }

    function startLoading() {
        $loading.css('display', 'block');
    }
    function stopLoading() {
        $loading.fadeOut('slow');
    }

    function setBaseURL() {
        baseURL = (window.location.href + "").split("\/");
        baseURL.pop();
        baseURL = baseURL.join("/") + "/";
        LOG("set baseURL: " + baseURL);
    }

    function disableLinks($l) {
        LOG("disabling links: " + $l.length);
        $l.addClass('disabled');
    }
    function enableLinks($l) {
        LOG("enabling links: " + $l.length);
        $l.removeClass('disabled');
    }

    function goTo(i) {
        var n;
        function done() {
            enableLinks($go_prevs);
            enableLinks($go_nexts);
            $content.html(contents[loc=i]);
            $prog.html(loc + " of " + length);
            if (loc==1)
                disableLinks($go_prevs);
            if (loc==length)
                disableLinks($go_nexts);
            stopLoading();
            LOG("goTo(" + loc + ") complete");
        }
        if (i < 1 || i > length) {
            LOG("invalid goTo(" + i + ") with length " + length);
            return;
        }
        if (i >= contents.length) {
            startLoading();
            n = 0;
            FORN(contents.length, LADD(length, i, i+NUM_PRELOAD), function(j) {
                ++n;
                LOG("begin to load #" + n);
                $.get(baseURL + "/data/" + j + ".html", function(data) {
                    --n;
                    contents[j] = data;
                    LOG("loaded contents[" + j + "] (still have " + n + " to load)");
                    if (!n)
                        done();
                });
            });
        } else {
            done();
        }
    }

    function load() {
        // load index
        $.getJSON(baseURL + "data/index.json", function(data) {
            title = data.title;
            LOG("set title: " + title);
            $title.html(title);
            length = data.length;
            LOG("set length: " + length);
            goTo(1);
        });
    }

    function registerDOMElems() {
        $loading = $("#loading");
        $title = $("#title");
        $go_prevs = $(".go_prev");
        LOG("go_prevs: " + $go_prevs.length);
        $go_nexts = $(".go_next");
        $prog = $("#prog");
        $content = $("#content");

        $go_prevs.click(function(e) {
            goTo(loc-1);
            e.preventDefault();
        });

        $go_nexts.click(function(e) {
            goTo(loc+1);
            e.preventDefault();
        });
    }

    function main() {
        setBaseURL();
        registerDOMElems();
        load();
    }

    $(document).ready(main);
})();
