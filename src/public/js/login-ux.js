/**
 * Mejoras UX del formulario de login:
 * - Validación on blur con mensajes específicos
 * - Toggle de visibilidad de contraseña
 * - Checklist de requisitos de contraseña en tiempo real
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REQUIREMENTS = [
  { text: 'Mínimo 6 caracteres', test: (pwd) => pwd.length >= 6 },
  { text: 'Al menos una mayúscula', test: (pwd) => /[A-Z]/.test(pwd) },
  { text: 'Al menos una minúscula', test: (pwd) => /[a-z]/.test(pwd) },
  { text: 'Al menos un número',    test: (pwd) => /\d/.test(pwd) },
];

function validateEmail(value) {
  const email = value.trim();
  if (!email) return { valid: true, message: '' };
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Email no válido. Ej: usuario@ejemplo.com' };
  }
  return { valid: true, message: '' };
}

function validatePassword(value) {
  if (value.length < 6) {
    return { valid: false, message: 'Mínimo 6 caracteres' };
  }
  return { valid: true, message: '' };
}

function setFieldState(input, { valid, message }) {
  const feedback = input.closest('.mb-3, .mb-4')?.querySelector('.invalid-feedback');
  input.classList.toggle('is-invalid', !valid);
  if (feedback) feedback.textContent = valid ? '' : message;
}

function renderPasswordRequirements(container, password) {
  const list = container.querySelector('ul');
  if (!list) return;

  list.replaceChildren(
    ...PASSWORD_REQUIREMENTS.map((req) => {
      const li = document.createElement('li');
      li.className = req.test(password) ? 'valid' : 'invalid';
      li.textContent = req.text;
      return li;
    })
  );
}

function setupPasswordToggle(button, input) {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    const icon = button.querySelector('i');
    icon?.classList.toggle('bi-eye', showing);
    icon?.classList.toggle('bi-eye-slash', !showing);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('contraseña');
  const toggleBtn = document.getElementById('toggle-password');
  const reqPassContainer = document.getElementById('req-pass');

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      setFieldState(emailInput, validateEmail(emailInput.value));
    });
  }

  if (passwordInput) {
    const showRequirements = () => reqPassContainer?.classList.add('show');

    passwordInput.addEventListener('focus', showRequirements);
    passwordInput.addEventListener('input', () => {
      showRequirements();
      if (reqPassContainer) {
        renderPasswordRequirements(reqPassContainer, passwordInput.value);
      }
    });
    passwordInput.addEventListener('blur', () => {
      setFieldState(passwordInput, validatePassword(passwordInput.value));
    });
  }

  if (toggleBtn && passwordInput) {
    setupPasswordToggle(toggleBtn, passwordInput);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      if (emailInput) setFieldState(emailInput, validateEmail(emailInput.value));
      if (passwordInput) setFieldState(passwordInput, validatePassword(passwordInput.value));

      if (form.querySelector('.is-invalid')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
});
