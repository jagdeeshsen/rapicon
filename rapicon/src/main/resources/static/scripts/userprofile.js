   // State management
   let isEditMode = false;
   let originalUserData = {};

   // Load user data on page load
   async function loadUserData() {
       const token = localStorage.getItem('user_token');
       const id = localStorage.getItem('user_id');

       if (!token || !id) {
           document.getElementById('userName').textContent = 'Welcome, Guest';
           document.getElementById('fullName').textContent = 'Welcome Guest';
           return;
       }

       try {
           const response = await fetch("/api/user/get-user?id=" + id, {
               method: 'GET',
               headers: {
                   'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               }
           });

           if (!response.ok) {
               throw new Error("Failed to fetch user");
           }

           const userData = await response.json();

           // Store original data for potential cancel
           originalUserData = { ...userData };

           displayUserData(userData);
       } catch (error) {
           showMessage.error('Error loading user data:', error);
           document.getElementById('userName').textContent = 'Error loading profile';
       }
   }

   // Display user data in the UI
   function displayUserData(userData) {
       document.getElementById('userName').textContent = userData.fullName || 'N/A';
       document.getElementById('userEmail').textContent = userData.email;
       document.getElementById('fullName').textContent = userData.fullName || 'N/A';
       document.getElementById('email').textContent = userData.email;
       document.getElementById('phone').textContent = userData.phone;
       document.getElementById('address').textContent = userData.streetAddress || 'N/A';
       document.getElementById('city').textContent = userData.city || 'N/A';
       document.getElementById('state').textContent = userData.state || 'N/A';
       document.getElementById('pincode').textContent = userData.zipCode || 'N/A';
       const createdAt = userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : 'N/A';
       document.getElementById('memberSince').textContent = createdAt || 'N/A';
       document.getElementById('country').textContent = userData.country || 'India';

       const initials = userData.fullName?.charAt(0).toUpperCase() || 'NA';
       document.getElementById('avatarInitial').textContent = initials;
   }

   // Convert text fields to input fields for editing
   async function enableEditMode() {
       isEditMode = true;

       // List of editable fields (excluding email and memberSince)
       const editableFields = [
           { id: 'fullName', type: 'text' },
           { id: 'phone', type: 'tel' },
           { id: 'address', type: 'text' },
           { id: 'city', type: 'text' },
           { id: 'state', type: 'text' },
           { id: 'pincode', type: 'text' },
           { id: 'country', type: 'text' }
       ];

       editableFields.forEach(field => {
           const element = document.getElementById(field.id);
           const currentValue = element.textContent;

           // Create input field
           const input = document.createElement('input');
           input.type = field.type;
           input.value = currentValue === 'N/A' ? '' : currentValue;
           input.className = 'edit-input';
           input.id = field.id;

           // Replace text with input
           element.parentNode.replaceChild(input, element);
       });

       // Update button states
       document.getElementById('editProfileBtn').style.display = 'none';
       document.getElementById('changePasswordBtn').textContent = 'Save';
       //document.getElementById('changePasswordBtn').classList.remove('btn-secondary');
       document.getElementById('changePasswordBtn').classList.add('btn-success');

       await showMessage.alert('Edit mode enabled. Make your changes and click Save.', 'info');
   }

   // Convert input fields back to text and save
   async function saveProfile() {

       const token = localStorage.getItem('user_token');
       const id = localStorage.getItem('user_id');

       if (!token || !id) {
           await showMessage.alert('Authentication required. Please login again.', 'error');
           return;
       }

       // Collect updated data
       const updatedData = {

           id: id,
           fullName: document.getElementById('fullName').value.trim(),
           phone: document.getElementById('phone').value.trim(),
           streetAddress: document.getElementById('address').value.trim(),
           city: document.getElementById('city').value.trim(),
           state: document.getElementById('state').value.trim(),
           zipCode: document.getElementById('pincode').value.trim(),
           country: document.getElementById('country').value.trim()
       };

       // Basic validation
       if (!updatedData.fullName) {
           showAlert('Full name is required', 'error');
           return;
       }

       if (!updatedData.phone) {
           showAlert('Phone number is required', 'error');
           return;
       }

       try {
           showAlert('Saving changes...', 'info');

           const response = await fetch("/api/user/update-user", {
               method: 'PUT',
               headers: {
                   'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify(updatedData)
           });

           if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.message || 'Failed to update profile');
           }

           const result = await response.json();

           // Update original data and display
           originalUserData = { ...originalUserData, ...updatedData };
           disableEditMode(updatedData);

           showMessage.success('Profile updated successfully!');

           // Update header name
           document.getElementById('userName').textContent = updatedData.fullName;
           const initials = updatedData.fullName.charAt(0).toUpperCase();
           document.getElementById('avatarInitial').textContent = initials;

       } catch (error) {
           showAlert(error.message || 'Failed to update profile. Please try again.', 'error');
       }
   }

   // Disable edit mode and restore text display
   function disableEditMode(data) {
       isEditMode = false;

       const fields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode', 'country'];

       fields.forEach(fieldId => {
           const input = document.getElementById(fieldId);
           if (input && input.tagName === 'INPUT') {
               const div = document.createElement('div');
               div.className = 'info-value';
               div.id = fieldId;
               div.textContent = input.value || 'N/A';

               input.parentNode.replaceChild(div, input);
           }
       });

       // Restore button states
       document.getElementById('editProfileBtn').style.display = 'inline-block';
       document.getElementById('changePasswordBtn').textContent = 'Change Password';
       document.getElementById('changePasswordBtn').classList.remove('btn-success');
       document.getElementById('changePasswordBtn').classList.add('btn-secondary');
   }

   // Show alert message
   function showAlert(message, type = 'success') {
       const alertContainer = document.getElementById('alertContainer');
       const alert = document.createElement('div');
       alert.className = `alert alert-${type} show`;
       alert.innerHTML = `<span>${message}</span>`;
       alertContainer.appendChild(alert);

       setTimeout(() => {
           alert.classList.remove('show');
           setTimeout(() => alert.remove(), 300);
       }, 3000);
   }

   // Logout functionality
   document.getElementById('logoutBtn').addEventListener('click', async function() {
       const result= await showMessage.confirm('Are you sure you want to logout?');
       if (result) {
           showAlert('Logging out...', 'info');

           const token = localStorage.getItem('user_token');

           try {
               await fetch('/api/auth/logout-user', {
                   method: 'POST',
                   headers: {
                       'Authorization': `Bearer ${token}`,
                       'Content-Type': 'application/json'
                   }
               });
           } catch (error) {
               console.warn('Logout request failed or not implemented on server:', error);
           }

           // Clear all local storage/session data
           localStorage.removeItem('user_token');
           localStorage.removeItem('userData');
           localStorage.removeItem('user_fullName');
           localStorage.removeItem('user_role');
           localStorage.removeItem('user_id');
           sessionStorage.clear();

           document.getElementById('userName').textContent = 'Guest';
           document.getElementById('fullName').textContent = 'Guest User';

           // Redirect to login page
           setTimeout(() => {
               window.location.href = '/otp-login.html';
           }, 1000);
       }
   });

   // Edit Profile button - Enable edit mode
   document.getElementById('editProfileBtn').addEventListener('click', function() {
       enableEditMode();
   });

   // Save/Change Password button - Save changes or change password
   document.getElementById('changePasswordBtn').addEventListener('click', function() {
       saveProfile();
   });

   // Load user data when page loads
   window.addEventListener('DOMContentLoaded', loadUserData);