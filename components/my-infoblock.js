class MyInfoblock extends HTMLElement {
    connectedCallback() {
        fetch('/components/infoblock.html')
            .then(response => response.text())
            .then(html => this.innerHTML = html)
            .catch(() => this.innerHTML = '<p>Ошибка загрузки</p>');
    }
}

customElements.define('my-infoblock', MyInfoblock);