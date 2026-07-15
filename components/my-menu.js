class MyMenu extends HTMLElement {
    connectedCallback() {
        fetch('/components/menu.html')
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;
                this.highlightActiveLink();
            })
            .catch(() => this.innerHTML = '<p>Ошибка загрузки меню</p>');
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname;
        const links = this.querySelectorAll('.menu-link');

        links.forEach(link => {
            link.classList.remove('active');

            const section = link.dataset.section;
            if (!section) return;

            // Совпадение либо с самой страницей раздела (information.html),
            // либо с любой вложенной страницей внутри папки раздела (/information/...)
            const isExactPage = currentPath.endsWith(`/${section}.html`);
            const isInsideSection = currentPath.includes(`/${section}/`);

            if (isExactPage || isInsideSection) {
                link.classList.add('active');
            }
        });
    }
}

customElements.define('my-menu', MyMenu);