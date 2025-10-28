  // Login form handling
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const formData = new FormData(this);
      const loginData = {
          username: formData.get('username'),
          password: formData.get('password'),
          role: formData.get('role')
      };

      try {
          // Mock API call - replace with actual endpoint
          const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(loginData)
          });

          if (response.ok) {
              const data = await response.json();

              // Store user data and token
              localStorage.setItem('token', data.token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('id', data.id);
              localStorage.setItem('fullName', data.fullName);

              localStorage.setItem('user', JSON.stringify(data));

              // Redirect based on role
              switch(data.role.toLowerCase()) {
                  case 'admin':
                      window.location.href = 'admin.html';
                      break;
                  case 'vendor':
                      window.location.href = 'vendor.html';
                      break;
                  case 'user':
                      window.location.href = 'user.html';
                      break;
                  default:
                      window.location.href = 'user.html';
              }
          } else {
              const errorData = await response.json();
              showError(errorData.message || 'Login failed. Please try again.');
          }
      } catch (error) {
          console.error('Login error:', error);
          showError('Network error. Please check your connection.');
      }
  });

  function showError(message) {
      const errorElement = document.getElementById('errorMessage');
      errorElement.textContent = message;
      errorElement.style.display = 'block';

      // Hide error after 5 seconds
      setTimeout(() => {
          errorElement.style.display = 'none';
      }, 5000);
  }

  // Check if user is already logged in
  if (localStorage.getItem('token')) {
      const user = localStorage.getItem('user');
      switch(user.role) {
          case 'admin':
              window.location.href = 'admin.html';
              break;
          case 'vendor':
              window.location.href = 'vendor.html';
              break;
          case 'user':
              window.location.href = 'user.html';
              break;
      }
  }