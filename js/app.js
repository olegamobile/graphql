const AUTH_URL = 'https://01.gritlab.ax/api/auth/signin';
const GRAPHQL_URL = 'https://01.gritlab.ax/api/graphql-engine/v1/graphql'

const personalInfo = document.getElementById('personalInfo');
const xpAmount = document.getElementById('xpAmount');
const audits = document.getElementById('audits');
const graph1 = document.getElementById('graph1');
const graph2 = document.getElementById('graph2');
const errorMessage = document.getElementById('errorMessage');
const passwordInput = document.getElementById('password');

var userData = {};
var auditData = {};
var auditorData = {};
var sortedAuditorList = [];

document.addEventListener('DOMContentLoaded', initialize)

async function initialize() {
    if (isLogged()) {
        console.log('logged')
        renderPage();
    } else {
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        })
    }
}