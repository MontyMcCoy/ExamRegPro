    function toggleForm(type) {
        const btn = document.getElementById('btn');
        const loginForm = document.getElementById('loginFormContainer');
        const registerForm = document.getElementById('registerFormContainer');
        const loginButton = document.querySelector('.toggle-btn:nth-child(2)');
        const registerButton = document.querySelector('.toggle-btn:nth-child(3)');

        if (type === 'login') {
            btn.style.left = '0';
            loginForm.classList.add('active-form');
            registerForm.classList.remove('active-form');
            loginButton.style.color = 'white';
            registerButton.style.color = 'black';
        } else if (type === 'register') {
            btn.style.left = '110px';
            registerForm.classList.add('active-form');
            loginForm.classList.remove('active-form');
            registerButton.style.color = 'white';
            loginButton.style.color = 'black';
        }
    }

    // Default to login form on page load
    window.onload = function() {
        toggleForm('login');
    }
