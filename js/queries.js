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
        attrs
    }
}
`;

const xpQuery = `
query {
  transaction(
    where: {
      _and: [
        { event: { path: { _eq: "/gritlab/school-curriculum" }}},
        { type: { _eq: "xp" } }
      ]
    }
    order_by: { createdAt: asc }
  ) {
    amount
    createdAt
    path
  }
}
`

const auditQuery = `
query {
  transaction(
    where: {
      _and: [
        { event: { path: { _eq: "/gritlab/school-curriculum" }}},
        { _or: [
          {type: { _eq: "up" }}, 
          {type: { _eq: "down" }}
          ]
        }
      ]
    }
    order_by: { createdAt: asc }
  ) {
    amount
    createdAt
    path
    type
  }
}`


const auditorsQuery = `
query {
  result(
    where: { type: { _eq: "user_audit" } }
  ) {
    audits(where: { auditedAt: { _is_null: false } }) {
      auditedAt
      auditor {
        login
        firstName
        lastName
      }
    }
  }
}`
  