function isLogged() {
    const token = sessionStorage.getItem('jwtToken');
    if (token === null) {
        return false;
    }
    return true;
}

function handleLogout() {
    sessionStorage.removeItem('jwtToken');
    personalInfo.innerHTML = '';
    xpAmount.innerHTML = '';
    audits.innerHTML = '';
    graph1.innerHTML = '';
    graph2.innerHTML = '';

    showModal('loginContainer');
    hideModal('mainContainer');
    document.title = 'Grit:lab user profile page';
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

    renderPage();

    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
}

async function renderPage() {
    hideModal('loginContainer');
    showModal('mainContainer');
    await fetchGraphQLData();
    document.title = `${userData.firstName} ${userData.lastName} Grit:lab profile`;
    drawAuditRatioGraph(auditData);
    drawAuditorsGraph(sortedAuditorList);
    updateDashboard();
}

function hideModal(containerId) {
    document.getElementById(containerId).classList.add('hidden')
}

function showModal(containerId) {
    document.getElementById(containerId).classList.remove('hidden')
}

function formatXP(xp) {
    if (xp >= 1_000_000) {
        return (xp / 1_000_000).toFixed(1) + 'M';
    } else if (xp >= 1_000) {
        return (xp / 1_000).toFixed(1) + 'K';
    } else {
        return xp.toString();
    }
}

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


function updateDashboard() {

    personalInfo.innerHTML = `
        <h2>User info</h2>
        <p>Login: <b style="color:red;">${userData.login}</b></p>
        <p>ID: <b>${userData.id}</b></p>
        <p>Name: <b>${userData.firstName}</b></p>
        <p>Surname: <b>${userData.lastName}</b></p>
    `;

    xpAmount.innerHTML = `
        <h2>XP Amount</h2>
        <p class="xp">${userData.totalXP}</p>
    `;

    audits.innerHTML = `
        <h2>Audits</h2>
        <p>Audits made: <b>${userData.auditsMade}</b> XP</p>
        <p>Audits received: <b>${userData.auditsReceived}</b> XP</p>
        <p>Audit ratio: <b>${userData.auditRatio}</b></p>
    `;
}