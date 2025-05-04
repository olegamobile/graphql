const AUTH_URL = 'https://01.gritlab.ax/api/auth/signin';
const GRAPHQL_URL = 'https://01.gritlab.ax/api/graphql-engine/v1/graphql'

const personalInfo = document.getElementById('personalInfo');
const xpAmount = document.getElementById('xpAmount');
const audits = document.getElementById('audits');
const graph1 = document.getElementById('graph1');
const graph2 = document.getElementById('graph2');

var userData = {};
var auditData = {};
var auditorData = {};
var sortedAuditorList = [];

document.addEventListener('DOMContentLoaded', initialize)

async function initialize() {
    if (isLogged()) {
        console.log('logged')
        renderPage();
    }
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

