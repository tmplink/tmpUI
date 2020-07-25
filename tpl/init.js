app.ready(() => {
    app.language_set('cn');
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
});