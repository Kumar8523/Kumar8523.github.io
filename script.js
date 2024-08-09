document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'c' || event.key === 'u' || event.key === 's')) {
        event.preventDefault();
    }
});

document.addEventListener('dragstart', event => event.preventDefault());