/**
 * Login UX Improvements
 *
 * Este módulo implementa mejoras de UX en el formulario de login:
 * - Validación on blur (al salir del campo, no al enviar)
 * - Toggle de visibilidad de contraseña
 * - Requisitos de contraseña mostrados en tiempo real
 * - Mensajes de error específicos y claros
 *
 * UX Principles aplicados:
 * 1. autofocus: reduce fricción, usuario empieza sin clic extra
 * 2. labels clickables: ya existen en HTML (for="...")
 * 3. placeholder con ejemplo: "tu@email.com", "••••••••"
 * 4. Toggle password visibility: reduce errores de escritura ciega
 * 5. Validación on blur (no on submit): feedback sin molestar
 * 6. Password requirements in real-time: usuario sabe qué falta
 * 7. Clear error messages: mensajes específicos, no genéricos
 * 8. Button text clear: "Entrar" comunica la acción
 */

document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('contraseña');
  const toggleBtn = document.getElementById('toggle-password');
  const reqPass = document.getElementById('req-pass');
  const form = document.querySelector('form');

  // ============================================================
  // 1. VALIDACIÓN DE EMAIL ON BLUR
  // ============================================================
  if (emailInput) {
    emailInput.addEventListener('blur', validateEmail);

    function validateEmail() {
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let isValid = true;
      let errorMsg = '';

      // Email vacío es válido aquí (required en HTML lo captura)
      if (email && !emailRegex.test(email)) {
        isValid = false;
        errorMsg = 'Email no válido. Ej: usuario@ejemplo.com';
      }

      updateFieldState(emailInput, isValid, errorMsg);
    }
  }

  // ============================================================
  // 2. TOGGLE DE VISIBILIDAD DE CONTRASEÑA
  // ============================================================
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';

      // Cambiar icono: ojo/ojo-slash
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
      }
    });
  }

  // ============================================================
  // 3. VALIDACIÓN DE CONTRASEÑA: ON INPUT + ON BLUR
  // ============================================================
  if (passwordInput) {
    // On input: mostrar requisitos y validar en tiempo real
    passwordInput.addEventListener('input', () => {
      if (reqPass) {
        reqPass.classList.add('show');
      }
      validatePasswordRequirements();
    });

    // On focus: mostrar requisitos
    passwordInput.addEventListener('focus', () => {
      if (reqPass) {
        reqPass.classList.add('show');
      }
    });

    // On blur: marcar campo inválido si no cumple mínimos
    passwordInput.addEventListener('blur', validatePassword);

    function validatePassword() {
      const password = passwordInput.value;
      const isValid = password.length >= 6;
      const errorMsg = !isValid ? 'Mínimo 6 caracteres' : '';

      updateFieldState(passwordInput, isValid, errorMsg);
    }
  }

  // ============================================================
  // 4. VALIDACIÓN DE REQUISITOS EN TIEMPO REAL
  // ============================================================
  function validatePasswordRequirements() {
    if (!reqPass) return;

    const password = passwordInput.value;

    // Requisitos a validar
    const requirements = [
      {
        id: 'req-length',
        text: 'Mínimo 6 caracteres',
        test: (pwd) => pwd.length >= 6,
      },
      {
        id: 'req-uppercase',
        text: 'Al menos una mayúscula',
        test: (pwd) => /[A-Z]/.test(pwd),
      },
      {
        id: 'req-lowercase',
        text: 'Al menos una minúscula',
        test: (pwd) => /[a-z]/.test(pwd),
      },
      {
        id: 'req-number',
        text: 'Al menos un número',
        test: (pwd) => /\d/.test(pwd),
      },
    ];

    // Crear o actualizar lista de requisitos
    let reqList = reqPass.querySelector('ul');
    if (!reqList) {
      reqList = document.createElement('ul');
      reqPass.appendChild(reqList);
    }

    // Limpiar y reconstruir lista
    reqList.innerHTML = '';
    requirements.forEach((req) => {
      const li = document.createElement('li');
      const isValid = req.test(password);
      li.className = isValid ? 'valid' : 'invalid';
      li.textContent = req.text;
      reqList.appendChild(li);
    });
  }

  // ============================================================
  // 5. HELPER: Actualizar estado visual del campo
  // ============================================================
  function updateFieldState(input, isValid, errorMsg) {
    // Limpiar feedback anterior
    const oldFeedback = input.parentElement.querySelector('.invalid-feedback');
    if (oldFeedback) {
      oldFeedback.remove();
    }

    // Actualizar clases
    if (isValid) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');

      // Crear y mostrar mensaje de error
      const feedbackDiv = document.createElement('div');
      feedbackDiv.className = 'invalid-feedback';
      feedbackDiv.textContent = errorMsg;
      input.parentElement.appendChild(feedbackDiv);
    }
  }

  // ============================================================
  // 6. VALIDACIÓN AL ENVIAR FORMULARIO
  // ============================================================
  if (form) {
    form.addEventListener('submit', (e) => {
      // Validar email y contraseña antes de enviar
      if (emailInput) {
        emailInput.dispatchEvent(new Event('blur'));
      }
      if (passwordInput) {
        passwordInput.dispatchEvent(new Event('blur'));
      }

      // Si hay campos inválidos, prevenir envío
      const hasInvalid = form.querySelector('.is-invalid');
      if (hasInvalid) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
});
