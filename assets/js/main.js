document.addEventListener('DOMContentLoaded', () => {
    //----------------------------------
    // Функция для просмотра пароля
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const wrapper = button.closest('.input-wrapper');
            const input = wrapper.querySelector('input');
            const eyeOpen = wrapper.querySelectorAll('.eye-open');
            const eyeClosed = wrapper.querySelectorAll('.eye-closed');

            if (input.type === 'password') {
                input.type = 'text';
                eyeOpen.forEach(el => el.style.display = 'none');
                eyeClosed.forEach(el => el.style.display = '');
            } else {
                input.type = 'password';
                eyeOpen.forEach(el => el.style.display = '');
                eyeClosed.forEach(el => el.style.display = 'none');
            }
        });
    });

    //----------------------------------
    // Функция переключения input radio
    function initRadioToggle(root = document) {
    const groups = root.querySelectorAll('[data-toggle-group]');

    groups.forEach(group => {
        const groupName = group.dataset.toggleGroup;
        const radios = group.querySelectorAll('input[type="radio"]');

        const update = () => {
        const checked = group.querySelector('input[type="radio"]:checked');
        if (!checked) return;
        const value = checked.value;

        document.querySelectorAll(`[data-toggle-target="${groupName}"]`).forEach(block => {
            const isMatch = block.dataset.toggleValue === value;
            block.hidden = !isMatch;

            if (!isMatch) {
            block.querySelectorAll('input, select, textarea').forEach(field => {
                if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = false;
                } else {
                field.value = '';
                }
            });
            }
        });
        };

        radios.forEach(radio => radio.addEventListener('change', update));
        update();
    });
    }

    initRadioToggle();

    //----------------------------------
    // Маска для телефона
    function initPhoneMask(selector) {
    const inputs = document.querySelectorAll(selector);

    inputs.forEach((input) => {
        input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.substring(1);
        }
        value = value.substring(0, 10);

        let formatted = '+7';
        if (value.length > 0) formatted += ' (' + value.substring(0, 3);
        if (value.length >= 3) formatted += ')';
        if (value.length > 3) formatted += ' ' + value.substring(3, 6);
        if (value.length > 6) formatted += '-' + value.substring(6, 8);
        if (value.length > 8) formatted += '-' + value.substring(8, 10);

        e.target.value = formatted;
        });
    });
    }

    initPhoneMask('.phone-mask');

    //----------------------------------
    // Пока обязательные поля не заполнятся, кнопка блокируется
    function initFormValidation(formSelector) {
    const forms = document.querySelectorAll(formSelector);

    forms.forEach((form) => {
        const submitButtons = form.querySelectorAll('button[type="submit"]');
        if (!submitButtons.length) return;

        const checkValidity = () => {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach((field) => {
            const isVisible = field.offsetParent !== null;
            if (isVisible && !field.checkValidity()) {
            isValid = false;
            }
        });

        submitButtons.forEach((btn) => {
            btn.disabled = !isValid;
        });
        };

        form.addEventListener('input', checkValidity);
        form.addEventListener('change', checkValidity);

        checkValidity();
    });
    }

    initFormValidation('form');

    //----------------------------------
    // Если у input стоит required в label в конце текста добавлялся span с классом reb
    function markRequiredLabels(formSelector) {
    const forms = document.querySelectorAll(formSelector);

    forms.forEach((form) => {
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach((field) => {
        let label = null;
        if (field.id) {
            label = form.querySelector(`label[for="${field.id}"]`);
        }
        if (!label) {
            label = field.closest('.input-group')?.querySelector('label');
        }

        if (label && !label.querySelector('.red')) {
            const span = document.createElement('span');
            span.className = 'red';
            span.innerHTML = '&ensp;*';
            label.appendChild(span);
        }
        });
    });
    }

    markRequiredLabels('form');

    //----------------------------------
    // Работает с любым количеством блоков .confirm-wrapper, где внутри лежат один input и один button (email, phone, и сколько угодно ещё).
    // Идентификатор поля для запросов к API берётся из button.dataset.target, либо (если атрибут не задан) из input.name / input.id.
    // Три состояния хранятся в wrapper.dataset.state (idle → code → confirmed), поэтому один и тот же обработчик клика обслуживает и отправку кода, и его проверку.
    // Под разметку нужно только убедиться, что каждая пара инпут+кнопка обёрнута в элемент с классом confirm-wrapper, и на кнопке (по желанию) стоит data-target="email" / data-target="phone" для идентификации на бэкенде.
    function initConfirmFields(wrapperSelector) {
    const wrappers = document.querySelectorAll(wrapperSelector);

    wrappers.forEach((wrapper) => {
        const input = wrapper.querySelector('input');
        const button = wrapper.querySelector('button');
        if (!input || !button) return;

        // Состояние блока: idle -> запрос кода, code -> проверка кода, confirmed -> готово
        wrapper.dataset.state = 'idle';

        // Сохраняем исходные данные, чтобы можно было вернуться/сбросить
        const original = {
        value: '',
        placeholder: input.placeholder,
        type: input.type,
        buttonText: button.textContent
        };

        // Кнопка активна только когда поле валидно (в состоянии idle)
        const checkValidity = () => {
        if (wrapper.dataset.state !== 'idle') return;
        button.disabled = !input.checkValidity();
        };

        input.addEventListener('input', checkValidity);
        checkValidity();

        button.addEventListener('click', () => {
        const state = wrapper.dataset.state;

        if (state === 'idle') {
            // Отправляем код на почту/телефон
            original.value = input.value;
            button.disabled = true;
            button.textContent = 'Отправка...';

            fetch('/api/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: button.dataset.target || input.name || input.id,
                value: original.value
            })
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                // Переключаем инпут на ввод кода
                input.type = 'text';
                input.value = '';
                input.placeholder = 'Введите полученный код';
                input.setAttribute('inputmode', 'numeric');
                input.removeAttribute('pattern');
                input.focus();

                button.textContent = 'Отправить';
                button.disabled = false;
                wrapper.dataset.state = 'code';
                } else {
                button.textContent = original.buttonText;
                button.disabled = false;
                alert(data.message || 'Не удалось отправить код');
                }
            })
            .catch(() => {
                button.textContent = original.buttonText;
                button.disabled = false;
                alert('Ошибка сети, попробуйте ещё раз');
            });

        } else if (state === 'code') {
            // Проверяем введённый код
            button.disabled = true;
            button.textContent = 'Проверка...';

            fetch('/api/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: button.dataset.target || input.name || input.id,
                code: input.value
            })
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                // Подтверждено — показываем исходное значение, блокируем поле
                input.type = original.type;
                input.value = original.value;
                input.readOnly = true;
                input.classList.add('confirmed');

                button.textContent = 'Подтверждено';
                button.classList.add('confirmed');
                button.disabled = true;
                wrapper.dataset.state = 'confirmed';
                } else {
                button.textContent = 'Отправить';
                button.disabled = false;
                input.classList.add('error');
                alert(data.message || 'Неверный код');
                }
            })
            .catch(() => {
                button.textContent = 'Отправить';
                button.disabled = false;
                alert('Ошибка сети, попробуйте ещё раз');
            });
        }
        });

        // Сброс в исходное состояние, если начали менять код руками, а не через кнопку
        input.addEventListener('input', () => {
        input.classList.remove('error');
        });
    });
    }

    initConfirmFields('.confirm-wrapper');

    //----------------------------------
    // Капча
    function initCaptcha(canvasId, inputId, options = {}) {
    const canvas = document.getElementById(canvasId);
    const input = document.getElementById(inputId);
    const ctx = canvas.getContext('2d');

    // Ищем блок для текста ошибки рядом с полем (как error-text в остальных полях формы)
    const errorEl = options.errorSelector
        ? document.querySelector(options.errorSelector)
        : input.closest('.input-group')?.querySelector('.error-text');

    let currentCode = '';

    function generateCode(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function draw() {
        currentCode = generateCode();
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = '#f4f6f9';
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(${rand(0,150)}, ${rand(0,150)}, ${rand(0,150)}, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rand(0, w), rand(0, h));
        ctx.bezierCurveTo(rand(0, w), rand(0, h), rand(0, w), rand(0, h), rand(0, w), rand(0, h));
        ctx.stroke();
        }

        const charWidth = w / (currentCode.length + 1);
        for (let i = 0; i < currentCode.length; i++) {
        const char = currentCode[i];
        const x = charWidth * (i + 1);
        const y = h / 2 + rand(-6, 6);
        const angle = rand(-25, 25) * (Math.PI / 180);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.font = `${rand(22, 28)}px Arial`;
        ctx.fillStyle = `rgb(${rand(20,90)}, ${rand(20,90)}, ${rand(20,90)})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, 0, 0);
        ctx.restore();
        }

        for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${rand(0,150)}, ${rand(0,150)}, ${rand(0,150)}, 0.5)`;
        ctx.fillRect(rand(0, w), rand(0, h), 1, 1);
        }
    }

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function showError(message) {
        input.classList.add('error');
        input.closest('.input-group')?.classList.add('error');
        if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        }
    }

    function clearError() {
        input.classList.remove('error');
        input.closest('.input-group')?.classList.remove('error');
        if (errorEl) {
        errorEl.style.display = 'none';
        }
    }

    // Обновление капчи по клику на картинку
    canvas.addEventListener('click', () => {
        input.value = '';
        clearError();
        draw();
    });

    // Сброс ошибки, как только начали печатать заново
    input.addEventListener('input', () => {
        clearError();
    });

    // Проверка кода. Возвращает true/false, обновляет капчу и подсвечивает ошибку при неверном вводе.
    function checkCaptcha() {
        const isValid = input.value.trim().toUpperCase() === currentCode;

        if (isValid) {
        clearError();
        } else {
        showError('Неверный код с картинки');
        input.value = '';
        draw(); // при ошибке всегда генерируем новый код — так безопаснее
        }

        return isValid;
    }

    draw();

    return { checkCaptcha, refresh: draw };
    }

    const captcha = initCaptcha('captcha-canvas', 'captcha', {
    errorSelector: '.captcha-group .error-text'
    });

    // Пример использования при отправке формы:
    document.querySelector('form').addEventListener('submit', (e) => {
    if (!captcha.checkCaptcha()) {
        e.preventDefault();
    }
    });
});