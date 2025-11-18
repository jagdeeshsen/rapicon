const form = document.getElementById('loanForm');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Validate all fields
        let isValid = true;

        // Name validation
        const name = document.getElementById('name').value.trim();
        if (name === '') {
            showError('name', 'nameError', 'Please enter your full name');
            isValid = false;
        }

        // Phone validation
        const phone = document.getElementById('phone').value.trim();
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (phone === '' || phone.length < 10 || !phoneRegex.test(phone)) {
            showError('phone', 'phoneError', 'Please enter a valid phone number');
            isValid = false;
        }

        // Email validation
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('email', 'emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Business validation
        const business = document.getElementById('business').value;
        if (business === '') {
            showError('business', 'businessError', 'Please select employment type');
            isValid = false;
        }

        // Salary validation
        const salary = document.getElementById('salary').value;
        if (salary === '' || salary <= 0) {
            showError('salary', 'salaryError', 'Please enter a valid salary amount');
            isValid = false;
        }

        // Loan amount validation
        const loanAmount = document.getElementById('loanAmount').value;
        if (loanAmount === '' || loanAmount < 1000) {
            showError('loanAmount', 'loanAmountError', 'Loan amount must be at least 1000');
            isValid = false;
        }

        // Address validation
        const address = document.getElementById('address').value.trim();
        if (address === '') {
            showError('address', 'addressError', 'Please enter your address');
            isValid = false;
        }

        // If all validations pass
        if (isValid) {
            // Show success message
            successMessage.classList.add('show');

            // Reset form
            form.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);

            // Log form data (in real application, this would be sent to server)
            const data={
                fullName: name,
                phone: phone,
                email: email,
                employmentType: business,
                salary: salary,
                loanAmount: loanAmount,
                address: address
            };
            // call method to send data to backend
            sendLoanFormData(data);
        }
    });

    async function sendLoanFormData(data){
        try{
            const token= localStorage.getItem('user_token');

            const response= await fetch("/api/loan/create-loan",{
                method: 'POST',
                headers:{
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if(!response.ok){
                throw new Error("Error to save data ");
            }else{
                console.log("Loan form submitted successfully");
            }
        }catch(e){
            throw new Error("Error", e.message);
        }
    }

    function showError(fieldId, errorId, message) {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(errorId);
        field.classList.add('error');
        error.textContent = message;
        error.classList.add('show');
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        const fields = document.querySelectorAll('input, select, textarea');

        errorMessages.forEach(error => error.classList.remove('show'));
        fields.forEach(field => field.classList.remove('error'));
    }

    // Remove error styling when user starts typing
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorId = this.id + 'Error';
            const error = document.getElementById(errorId);
            if (error) {
                error.classList.remove('show');
            }
        });
    });