class MyFooter extends HTMLElement {
    async connectedCallback() {
        try {
            const response = await fetch('/components/footer.html');
            let html = await response.text();
            
            // Заменяем переменные
            html = html.replace(/\${year}/g, new Date().getFullYear());
            // html = html.replace(/\${companyName}/g, this.getAttribute('company-name') || 'Пример');
            
            this.innerHTML = html;
        } catch (error) {
            console.error('Ошибка:', error);
            this.innerHTML = '<p>Ошибка загрузки подвала</p>';
        }
    }
}

customElements.define('my-footer', MyFooter);