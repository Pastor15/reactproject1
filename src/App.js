import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State hooks to manage employee data and form inputs
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [photo, setPhoto] = useState(null); // State to hold employee photo
  const [editing, setEditing] = useState(false); // State to manage edit mode
  const [editEmployeeId, setEditEmployeeId] = useState(''); // Employee ID for editing

  // Load employees from JSON Server on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Function to fetch employees from JSON Server
  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Function to add a new employee or update an existing one
  const addOrUpdateEmployee = async () => {
    // Validate required fields
    if (!employeeId || !firstName || !lastName || !email || !position) {
      alert('Please fill in all fields');
      return;
    }

    const newEmployee = {
      id: employeeId,
      firstName,
      lastName,
      email,
      position,
      photo // Include photo in new employee object
    };

    try {
      if (editing) {
        await axios.put(`http://localhost:5000/employees/${editEmployeeId}`, newEmployee);
        // Update employees state after successful update
        const updatedEmployees = employees.map(emp =>
          emp.id === editEmployeeId ? { ...emp, ...newEmployee } : emp
        );
        setEmployees(updatedEmployees);
        setEditing(false);
        setEditEmployeeId('');
        alert('Employee updated successfully!');
      } else {
        await axios.post('http://localhost:5000/employees', newEmployee);
        // Update employees state after successful addition
        setEmployees([...employees, newEmployee]);
        alert('Employee added successfully!');
      }

      // Reset form inputs
      setEmployeeId('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPosition('');
      setPhoto(null); // Clear photo state after adding/updating employee
    } catch (error) {
      console.error('Error adding/updating employee:', error);
      // Handle error
    }
  };

  // Function to handle edit mode and populate form with employee data
  const editEmployee = (id) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setEmployeeId(employee.id);
      setFirstName(employee.firstName);
      setLastName(employee.lastName);
      setEmail(employee.email);
      setPosition(employee.position);
      setEditing(true);
      setEditEmployeeId(employee.id);
      setSearchResult(null); // Clear search result if editing
    }
  };

  // Function to search for an employee by ID
  const searchEmployee = () => {
    const employee = employees.find(emp => emp.id === searchId);
    setSearchResult(employee);
  };

  // Function to delete an employee from the list
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      // Update employees state after successful deletion
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      setSearchResult(null);
      setEditing(false); // Exit edit mode if deleting the edited employee
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      // Handle error
    }
  };

  // Function to handle photo selection from input
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  return (
    <div className="form-container">
      {/* Form to add or edit an employee */}
      <form className="employee-form">
        <h2>{editing ? 'Edit Employee' : 'Add Employee'}</h2>
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            type="text"
            id="employeeId"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="position">Position</label>
          <input
            type="text"
            id="position"
            value={position}
            onChange={e => setPosition(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="photo">Photo</label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>
        <button type="button" onClick={addOrUpdateEmployee}>
          {editing ? 'Update Employee' : 'Add Employee'}
        </button>
      </form>

      {/* Form to search for an employee by ID */}
      <form className="search-form">
        <h2>Search Employee by ID</h2>
        <div className="form-group">
          <label htmlFor="searchId">Employee ID</label>
          <input
            type="text"
            id="searchId"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            required
          />
        </div>
        <button type="button" onClick={searchEmployee}>Search</button>
      </form>

      {/* Display search result if found */}
      {searchResult && (
        <div className="employee-details">
          <h3>Employee Details</h3>
          <div>
            {/* Display employee photo if available */}
            <img src={searchResult.photo ? URL.createObjectURL(searchResult.photo) : '/default-avatar.png'} alt="Employee Photo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
          </div>
          <p><strong>ID:</strong> {searchResult.id}</p>
          <p><strong>First Name:</strong> {searchResult.firstName}</p>
          <p><strong>Last Name:</strong> {searchResult.lastName}</p>
          <p><strong>Email:</strong> {searchResult.email}</p>
          <p><strong>Position:</strong> {searchResult.position}</p>
          <button type="button" onClick={() => deleteEmployee(searchResult.id)}>Delete Employee</button>
          <button type="button" onClick={() => editEmployee(searchResult.id)}>Edit Employee</button>
        </div>
      )}

      {/* Display list of all employees */}
      <div className="employee-list">
        <h2>Employee List</h2>
        <ul>
          {employees.map(emp => (
            <li key={emp.id}>
              {emp.firstName} {emp.lastName} - {emp.position}
              <button type="button" onClick={() => editEmployee(emp.id)}>Edit</button>
              <button type="button" onClick={() => deleteEmployee(emp.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
