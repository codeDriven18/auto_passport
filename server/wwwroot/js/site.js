(function () {
    const links = document.querySelectorAll('[data-branch-link]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetPath = link.getAttribute('href') || '/Gigs';
            const branch = link.getAttribute('data-branch') || '';

            const url = new URL(window.location.href);
            url.pathname = targetPath;

            // Preserve all existing params; override branch only.
            if (branch) {
                url.searchParams.set('branch', branch);
            }

            window.location.href = url.toString();
        });
    });
})();
