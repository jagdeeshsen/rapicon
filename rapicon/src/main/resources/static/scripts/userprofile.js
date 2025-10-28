// Simulated user data - Replace with actual data from your backend
    /*const userData = {
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 9876543210",
        address: "123 Main Street, Apartment 4B",
        city: "Bhopal",
        state: "Madhya Pradesh",
        pincode: "462001",
        memberSince: "January 2024"
    };*/

    // Load user data on page load
    async function loadUserData() {
        const token= localStorage.getItem('token');
        const id= localStorage.getItem('id');

        if(!token || !id){
            document.getElementById('userName').textContent = 'Welcome, Guest';
            document.getElementById('fullName').textContent = 'Welcome Guest';
        }

        try{
            const response= await fetch("/api/user/get-user?id="+ id,{
                method: 'GET',
                headers:{
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(!response.ok){
                throw new Error("Failed to fetch user");
            }

            const userData= await response.json();

            document.getElementById('userName').textContent = userData.firstname +" "+ userData.lastname;
            document.getElementById('userEmail').textContent = userData.email;
            document.getElementById('fullName').textContent = userData.firstname +" " + userData.lastname;
            document.getElementById('email').textContent = userData.email;
            document.getElementById('phone').textContent = userData.phone;
            document.getElementById('address').textContent = userData.address || 'N/A';
            document.getElementById('city').textContent = userData.city || 'Indore';
            document.getElementById('state').textContent = userData.state || 'Madhya Pradesh';
            document.getElementById('pincode').textContent = userData.pincode || 'N/A';
            document.getElementById('memberSince').textContent = userData.memberSince || 'N/A';

            // Set avatar initial
            const initials = userData.firstname.charAt(0).toUpperCase()+userData.lastname.charAt(0).toUpperCase();
            document.getElementById('avatarInitial').textContent = initials;
        }catch (error) {
             console.error('Error loading user data:', error);
             document.getElementById('userName').textContent = 'Error loading profile';
        }
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
        if (confirm('Are you sure you want to logout?')) {
            showAlert('Logging out...', 'info');

            const token = localStorage.getItem('token');

            try {
                // Optional: Notify backend to invalidate the session/token
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.warn('Logout request failed or not implemented on server:', error);
            }

            // ✅ Clear all local storage/session data
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            localStorage.removeItem('fullName');
            localStorage.removeItem('role');
            localStorage.removeItem('id');
            sessionStorage.clear();

            document.getElementById('userName').textContent = 'Guest';
            document.getElementById('fullName').textContent = 'Guest User';

            // ✅ Redirect to login page
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
        }
    });

    // Edit Profile button
    document.getElementById('editProfileBtn').addEventListener('click', function() {
        // Redirect to edit profile page or show edit modal
        showAlert('Edit profile feature - Redirect to edit page', 'info');
        // window.location.href = '/edit-profile.html';
    });

    // Change Password button
    document.getElementById('changePasswordBtn').addEventListener('click', function() {
        // Redirect to change password page or show modal
        showAlert('Change password feature - Redirect to change password page', 'info');
        // window.location.href = '/change-password.html';
    });

    // Load user data when page loads
    window.addEventListener('DOMContentLoaded', loadUserData);