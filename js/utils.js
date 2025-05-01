function isLogged() {
    const token = sessionStorage.getItemItem('jwtToken');
    if (typeof token === null) return false;
    return true;
}

function handleLogout() {
    sessionStorage.removeItem('jwtToken');
    personalInfo.innerHTML = '';
    xpAmount.innerHTML = '';
    audits.innerHTML = '';
    showModal('loginContainer');
    hideModal('mainContainer');
}


async function handleLogin() {
    const identifier = document.getElementById('identifier').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!identifier || !password) {
        errorMessage.textContent = 'Please enter both identifier and password';
        errorMessage.style.display = 'block';
        return;
    }

    const credentials = btoa(`${identifier}:${password}`);
    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData)
            errorMessage.textContent = errorData.error || 'Login failed';
            errorMessage.style.display = 'block';
            return;
        }

        const token = await response.json();
        sessionStorage.setItem('jwtToken', token);
        password.textContent = '';

        hideModal('loginContainer');
        showModal('mainContainer');

        const data = await fetchGraphQLData();
        updateDashboard(data)

    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
}

function hideModal(containerId) {
    document.getElementById(containerId).classList.add('hidden')
}

function showModal(containerId) {
    document.getElementById(containerId).classList.remove('hidden')
}

function formatXP(xp) {
    if (xp >= 1_000_000) {
        return (xp / 1_000_000).toFixed(1).replace('.', ',') + 'M';
    } else if (xp >= 1_000) {
        return (xp / 1_000).toFixed(1).replace('.', ',') + 'K';
    } else {
        return xp.toString();
    }
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
