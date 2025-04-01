import gql from 'graphql-tag';

export const LOGIN = gql`
  query Login($username: String, $email: String, $password: String!) {
    login(username: $username, email: $email, password: $password) {
      token
      message
      user {
        _id
        username
        email
      }
    }
  }
`;

export const SIGNUP = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      token
      message
      user {
        _id
        username
        email
      }
    }
  }
`;

export const GET_ALL_EMPLOYEES = gql`
  query {
    getAllEmployees {
      _id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

export const ADD_NEW_EMPLOYEE = gql`
  mutation AddNewEmployee($input: EmployeeInput!) {
    addNewEmployee(input: $input) {
      _id
      first_name
      last_name
      email
    }
  }
`;

export const SEARCH_EMPLOYEES = gql`
  query SearchEmployees($designation: String, $department: String) {
    searchEmployeeByDesignationOrDepartment(
      designation: $designation
      department: $department
    ) {
      _id
      first_name
      last_name
      email
      designation
      department
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($eid: ID!) {
    deleteEmployeeByEid(eid: $eid) {
      message
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($eid: ID!, $input: EmployeeInput!) {
    updateEmployeeByEid(eid: $eid, input: $input) {
      _id
      first_name
      last_name
      email
      designation
      department
    }
  }
`;

export const SEARCH_EMPLOYEE_BY_ID = gql`
  query searchEmployeeByEid($eid: ID!) {
    searchEmployeeByEid(eid: $eid) {
      _id
      first_name
      last_name
      email
      designation
      department
      gender
      salary
      date_of_joining
      employee_photo
    }
  }
`;
