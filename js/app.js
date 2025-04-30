const AUTH_URL = 'https://01.gritlab.ax/api/auth/signin';
const GRAPHQL_URL = 'https://01.gritlab.ax/api/graphql-engine/v1/graphql'

document.addEventListener('DOMContentLoaded', initialize)

async function initialize() {
    if (isLogged) {
        hideModal('loginContainer');
        showModal('mainContainer');
        const data = await fetchGraphQLData();
        updateDashboard(data)
    } 
}

function isLogged() {
    const token = sessionStorage.getItemItem('jwtToken');
    if (typeof token === null) return false;
    return true;
}

async function fetchGraphQLData() {
    const result = await fetchQuery(generalDataQuery);
    return result
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

        hideModal('loginContainer');
        showModal('mainContainer');
        const data = fetchGraphQLData();
        console.log(data)
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
            console.log('Bad token')
            sessionStorage.removeItem('jwtToken')
            hideModal('mainContainer');
            showModal('loginContainer');
            return;
        }
        return data.data;

    } catch (error) {
        console.error('Error fetching GraphQL data:', error);
    }
}

function updateDashboard(data) {
    const personalInfo = document.getElementById('personalInfo');
    const xpAmount = document.getElementById('xpAmount');
    const audits = document.getElementById('audits');
    const auditRatio = data.user[0].auditRatio;

    personalInfo.innerHTML = `
        <h2>Personal Information</h2>
        <p>Login: ${data.user[0].login}</p>
        <p>ID: ${data.user[0].id}</p>
        <p>Name: ${data.user[0].firstName}</p>
        <p>Surname: ${data.user[0].lastName}</p>
        <p>Audit ratio: ${auditRatio}</p>
    `;

    xpAmount.innerHTML = `
        <h2>XP Amount</h2>
        <p>Total Up: ${data.user[0].totalUp}</p>
        <p>Total Down: ${data.user[0].totalDown}</p>
    `;

    audits.innerHTML = `
        <h2>Audits</h2>
        <p>Total Up: ${data.user[0].totalUp}</p>
        <p>Total Down: ${data.user[0].totalDown}</p>
    `;
}