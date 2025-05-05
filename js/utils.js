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
    let password = passwordInput.value;


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
        passwordInput.value = '';
        password = '';
        errorMessage.value = '';
        errorMessage.style.display = 'none';

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
    window.scrollTo(0, 0);
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

async function fetchGraphQLData() {
    const generalData = await fetchQuery(generalDataQuery);
    const data = generalData.user[0];
    userData.auditRatio = data.auditRatio.toFixed(2) || '';
    userData.auditsMade = formatXP(data.totalUp) || '';
    userData.auditsReceived = formatXP(data.totalDown) || '';
    userData.login = data.login || ''
    userData.id = data.id || '';
    userData.firstName = data.firstName || '';
    userData.lastName = data.lastName || '';

    const xpData = await fetchQuery(xpQuery);

    xpTransactions = xpData.transaction || [];
    const totalXP = xpTransactions.reduce((sum, xp) => {
        return sum + xp.amount;
    }, 0)

    userData.totalXP = formatXP(totalXP) || '';
    auditData = await fetchQuery(auditQuery);
    auditorData = await fetchQuery(auditorsQuery);

    const auditCounts = {};
    auditorData.result.forEach(result => {
        result.audits.forEach(audit => {
            const auditor = audit.auditor;
            if (!auditor) return;

            const key = auditor.login;

            if (!auditCounts[key]) {
                auditCounts[key] = {
                    login: auditor.login,
                    firstName: auditor.firstName,
                    lastName: auditor.lastName,
                    count: 0
                };
            }
            auditCounts[key].count += 1;
        });
    });

    sortedAuditorList = Object.values(auditCounts).sort((a, b) => b.count - a.count);
}


async function fetchQuery(query) {
    const token = sessionStorage.getItem('jwtToken');

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch GraphQL data');
        }

        const data = await response.json();

        if (data.errors && data.errors[0].message.includes('Could not verify JWT')) {
            sessionStorage.removeItem('jwtToken')
            hideModal('mainContainer');
            showModal('loginContainer');
            throw new Error('Bad token')
            return;
        }
        return data.data;

    } catch (error) {
        console.error('Error fetching GraphQL data:', error);
    }
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