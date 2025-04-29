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
        const response = await fetch('https://01.gritlab.ax/api/auth/signin', {
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

        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';

        fetchGraphQLData();
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
}

async function fetchGraphQLData() {
    const token = sessionStorage.getItem('jwtToken');
    const query = `
        query {
            user {
                id
                firstName
                lastName
                login
                auditRatio
                totalUp
                totalDown
                xps {
                amount
                path
                }
                attrs
            }
        }
    `;

    try {
        const response = await fetch('https://01.gritlab.ax/api/graphql-engine/v1/graphql', {
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
        updateDashboard(data.data);
    } catch (error) {
        console.error('Error fetching GraphQL data:', error);
    }
}

function updateDashboard(data) {
    const personalInfo = document.getElementById('personalInfo');
    const xpAmount = document.getElementById('xpAmount');
    const audits = document.getElementById('audits');

    personalInfo.innerHTML = `
        <h2>Personal Information</h2>
        <p>Login: ${data.user[0].login}</p>
        <p>ID: ${data.user[0].id}</p>
        <p>Attrs: ${JSON.stringify(data.user[0].attrs.tshirtSize)}</p>
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