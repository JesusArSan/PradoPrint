document.querySelectorAll('.auto-submit').forEach((input) => {
  input.addEventListener('change', () => {
    input.closest('form').submit();
  });
});
