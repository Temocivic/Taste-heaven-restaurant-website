(() => {
  'use strict';

  const grid = document.querySelector('#dish-grid');
  if (grid) {
    const cards = [...grid.querySelectorAll('.dish-card')];
    const filters = [...document.querySelectorAll('[data-filter]')];
    const search = document.querySelector('#menu-search');
    const status = document.querySelector('#menu-status');
    const empty = document.querySelector('#no-results');
    let category = 'all';

    const updateMenu = () => {
      const query = (search?.value || '').trim().toLocaleLowerCase();
      let count = 0;

      cards.forEach(card => {
        const categoryMatch =
          category === 'all' || card.dataset.category === category;
        const queryMatch =
          !query || card.textContent.toLocaleLowerCase().includes(query);
        const visible = categoryMatch && queryMatch;

        card.hidden = !visible;
        if (visible) count += 1;
      });

      if (empty) empty.hidden = count > 0;
      if (status) {
        status.textContent =
          `Showing ${count} ${count === 1 ? 'dish' : 'dishes'}` +
          `${category === 'all' ? '' : ` in ${category}`}` +
          `${query ? ` matching “${search.value.trim()}”` : ''}.`;
      }
    };

    filters.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter || 'all';

      filters.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      updateMenu();
    }));

    search?.addEventListener('input', updateMenu);
    updateMenu();
  }

  const forms = [
    { form: document.querySelector('#reservation-form'), kind: 'reservation' },
    { form: document.querySelector('#contact-form'), kind: 'contact' }
  ].filter(item => item.form);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const namePattern = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
  const phonePattern = /^\d{11}$/;

  const todayLocal = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  };

  forms.forEach(({ form, kind }) => {
    const dateInput = form.elements.namedItem('date');
    if (dateInput) dateInput.min = todayLocal();

    const message = form.querySelector('.form-message');

    const errorNode = input => {
      if (input.name === 'policy') {
        return form.querySelector('.policy-error');
      }

      return input.closest('.field')?.querySelector('.field-error');
    };

    const showError = (input, text) => {
      const node = errorNode(input);
      if (node) node.textContent = text;
      input.setAttribute('aria-invalid', 'true');
      return text;
    };

    const clearError = input => {
      const node = errorNode(input);
      if (node) node.textContent = '';
      input.removeAttribute('aria-invalid');
    };

    const validate = input => {
      clearError(input);

      const value =
        typeof input.value === 'string' ? input.value.trim() : '';

      if (input.type === 'checkbox') {
        if (input.required && !input.checked) {
          return showError(input, 'Please agree before continuing.');
        }
        return '';
      }

      if (input.required && !value) {
        return showError(input, 'This field is required.');
      }

      if (!value) return '';

      if (input.name === 'name' && value.length < 2) {
        return showError(input, 'Please enter at least 2 characters.');
      }

      if (input.name === 'name' && !namePattern.test(value)) {
        return showError(
          input,
          'Use letters only; numbers are not allowed.'
        );
      }

      if (input.name === 'email' && !emailPattern.test(value)) {
        return showError(
          input,
          'Enter a valid email address, such as name@example.com.'
        );
      }

      if (input.name === 'phone' && !phonePattern.test(value)) {
        return showError(
          input,
          'Enter exactly 11 digits, with no letters or spaces.'
        );
      }

      if (input.name === 'message' && value.length < 10) {
        return showError(input, 'Please write at least 10 characters.');
      }

      if (input.name === 'date' && value < todayLocal()) {
        return showError(input, 'Choose today or a future date.');
      }

      if (input.name === 'time' && dateInput?.value === todayLocal()) {
        const [hours, minutes] = value.split(':').map(Number);
        const selected = hours * 60 + minutes;
        const now = new Date();
        const earliest = now.getHours() * 60 + now.getMinutes() + 30;

        if (selected < earliest) {
          return showError(
            input,
            'For today, choose a time at least 30 minutes from now.'
          );
        }
      }

      if (input.name === 'guests') {
        const number = Number(value);

        if (!Number.isInteger(number) || number < 1 || number > 12) {
          return showError(input, 'Choose a whole number from 1 to 12.');
        }
      }

      return '';
    };

    form.querySelectorAll('input,select,textarea').forEach(input => {
      input.addEventListener('input', () => {
        validate(input);

        if (message) {
          message.textContent = '';
          message.className = 'form-message';
        }
      });

      input.addEventListener('change', () => validate(input));
    });

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (message) {
        message.textContent = '';
        message.className = 'form-message';
      }

      const controls = [
        ...form.querySelectorAll('input,select,textarea')
      ].filter(input => !input.disabled);

      const invalid = controls.filter(input => validate(input));

      if (invalid.length) {
        if (message) {
          message.textContent =
            'Please check the highlighted fields and try again.';
          message.classList.add('error');
        }

        invalid[0].focus();
        return;
      }

      if (message) {
        message.textContent = kind === 'reservation'
          ? 'Your details passed validation. This sample website does not send bookings yet; please call the restaurant to confirm.'
          : 'Your message passed validation. This sample website does not send messages yet; please use the contact details above.';

        message.classList.add('success');
      }
    });
  });
})();