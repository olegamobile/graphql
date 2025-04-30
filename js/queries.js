const generalDataQuery = `
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