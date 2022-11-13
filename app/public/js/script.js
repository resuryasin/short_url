let clipboard = new ClipboardJS('#copy');
clipboard.on('success', function(e) {
    document.getElementById('copy').innerHTML = '<i class="bi bi-clipboard-check" aria-hidden="true"></i> Copied';
    setTimeout(() => {
        document.getElementById('copy').innerHTML = '<i class="bi bi-clipboard" aria-hidden="true"></i> Copy';
    }, 5000);
});

let redirect = document.getElementById('redirect');
redirect.addEventListener('click', function() {
    let short_url = document.getElementById('short_url').value;
    window.location.href = short_url;
});

const form = document.querySelector('form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.querySelector('#url').value;
    if (!url) {
        return;
    }
    const result = await fetch('/api/shorturl', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ url })
    });
    const data = await result.json();
    if (data.error) {
        let toastBody = document.getElementById('toastMessageContent');
        toastBody.innerHTML = data.error;
        let toast = document.getElementById('toastMessage');
        toast.classList.add('show');
    } else {
        document.querySelector('#short_url').value = data.short_url;
        document.querySelector('#result').classList.add('show');
    }
});

form.addEventListener('reset', (e) => {
    document.querySelector('#short_url').value = '';
    document.querySelector('#result').classList.remove('show');
});