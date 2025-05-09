function toggleForm(form) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginToggle = document.querySelector('.form-toggle button:first-child');
    const registerToggle = document.getElementById('register-toggle');

    if (form === 'login') {
        loginForm.style.display = 'block';
        loginForm.classList.add('active');
        registerForm.style.display = 'none';
        registerForm.classList.remove('active');
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        loginForm.classList.remove('active');
        registerForm.style.display = 'block';
        registerForm.classList.add('active');
        loginToggle.classList.remove('active');
        registerToggle.classList.add('active');
    }
}