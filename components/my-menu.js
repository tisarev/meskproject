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
        // Получаем текущий URL
        const currentPath = window.location.pathname;
        
        // Находим все ссылки в меню
        const links = this.querySelectorAll('.menu-link');
        
        links.forEach(link => {
            // Получаем путь из href
            const linkPath = link.getAttribute('href');
            
            // Убираем класс active у всех
            link.classList.remove('active');
            
            // Проверяем совпадение
            if (currentPath === linkPath) {
                link.classList.add('active');
            }
            
            // Особый случай для главной страницы
            if (currentPath === '/' && linkPath === '/') {
                link.classList.add('active');
            }
            
            // Если текущий путь заканчивается на linkPath (для about.html и т.д.)
            if (currentPath !== '/' && linkPath !== '/' && currentPath.endsWith(linkPath)) {
                link.classList.add('active');
            }
        });
    }
}

customElements.define('my-menu', MyMenu);