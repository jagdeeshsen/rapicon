/* ==========================================================================
   PROFILE LOGIC — unchanged from scripts/userprofile.js (as already fixed
   in this conversation: leading-slash fix on the get-user endpoint, token
   key 'user_token'). Only the "Orders" stat card's click handler changed —
   see the note near the bottom, in the new dashboard-nav section.
   ========================================================================== */

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
       const response = await fetch(`api/user/${id}`, {
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

function displayUserData(userData) {
    document.getElementById('userName').textContent = userData.fullName || 'N/A';
    document.getElementById('userEmail').textContent = userData.email;
    setValue('fullName', userData.fullName || 'N/A');
    setValue('email', userData.email);
    setValue('phone', userData.phone);
    setValue('address', userData.streetAddress || 'N/A');
    setValue('city', userData.city || 'N/A');
    setValue('state', userData.state || 'N/A');
    setValue('pincode', userData.zipCode || 'N/A');
    const createdAt = userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : 'N/A';
    setValue('memberSince', createdAt || 'N/A');
    document.getElementById('country').value = userData.country || 'Other';

    const initials = userData.fullName?.charAt(0).toUpperCase() || 'NA';
    document.getElementById('avatarInitial').textContent = initials;
}

function setValue(id, text) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.classList.remove('loading');
}

async function enableEditMode() {
    isEditMode = true;

    const editableFields = [
        { id: 'fullName', type: 'text' },
        { id: 'email', type: 'text' },
        { id: 'address', type: 'text' },
        { id: 'city', type: 'text' },
        { id: 'state', type: 'text' },
        { id: 'pincode', type: 'text' }
    ];

    editableFields.forEach(field => {
        const element = document.getElementById(field.id);
        const currentValue = element.textContent;

        const input = document.createElement('input');
        input.type = field.type;
        input.value = currentValue === 'N/A' ? '' : currentValue;
        input.className = 'edit-input';
        input.id = field.id;

        element.parentNode.replaceChild(input, element);
    });

    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('changePasswordBtn').textContent = 'Save';
    document.getElementById('changePasswordBtn').classList.remove('btn-secondary');
    document.getElementById('changePasswordBtn').classList.add('btn-success');

    await showMessage.alert('Edit mode enabled. Make your changes and click Save.', 'info');

    const country = document.getElementById('country');
    if (country) {
        country.disabled = false;
    }
}

async function saveProfile() {

    const token = localStorage.getItem('user_token');
    const id = localStorage.getItem('user_id');

    if (!token || !id) {
        await showMessage.alert('Authentication required. Please login again.', 'error');
        return;
    }

    const updatedData = {
        id: id,
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        streetAddress: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('pincode').value.trim(),
        country: document.getElementById('country').value.trim()
    };

    if (!updatedData.fullName) {
        showAlert('Full name is required', 'error');
        return;
    }

    if (!updatedData.email) {
        showAlert('Email address is required', 'error');
        return;
    }

    try {
        showAlert('Saving changes...', 'info');

        const response = await fetch("/api/user/update", {
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

        originalUserData = { ...originalUserData, ...updatedData };
        disableEditMode(updatedData);

        showMessage.success('Profile updated successfully!');

        document.getElementById('userName').textContent = updatedData.fullName;
        const initials = updatedData.fullName.charAt(0).toUpperCase();
        document.getElementById('avatarInitial').textContent = initials;

    } catch (error) {
        showAlert(error.message || 'Failed to update profile. Please try again.', 'error');
    }
}

function disableEditMode(data) {
    isEditMode = false;

    const fields = ['fullName', 'email', 'address', 'city', 'state', 'pincode'];

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

    document.getElementById('editProfileBtn').style.display = 'inline-block';
    document.getElementById('changePasswordBtn').textContent = 'Change Password';
    document.getElementById('changePasswordBtn').classList.remove('btn-success');
    document.getElementById('changePasswordBtn').classList.add('btn-secondary');

    const country = document.getElementById('country');
    if (country) {
        country.disabled = true;
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<span>${message}</span>`;
    alertContainer.appendChild(alert);
    requestAnimationFrame(() => alert.classList.add('show'));

    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Logout functionality — id="logoutBtn" now lives in the sidebar instead
// of the panel's action-buttons row; behavior is identical.
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

        localStorage.removeItem('user_token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user_fullName');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        sessionStorage.clear();

        document.getElementById('userName').textContent = 'Guest';
        document.getElementById('fullName').textContent = 'Guest User';

        setTimeout(() => {
            window.location.href = '/otp-login.html';
        }, 1000);
    }
});

// Delete functionality
document.getElementById('deleteBtn').addEventListener('click', async function () {

    const token = localStorage.getItem('user_token');
    const id = localStorage.getItem('user_id');
    const phone = originalUserData.phone;

    if (!token || !id) {
        await showMessage.alert('Authentication required. Please login again.', 'error');
        return;
    }

    const confirmDelete = await showMessage.confirm(
        'This action is permanent. Are you sure you want to delete your account?'
    );

    if (!confirmDelete) return;

    try {
        showAlert('Sending OTP...', 'info');

        const otpResponse = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phone })
        });

        if (!otpResponse.ok) {
            throw new Error("Failed to send OTP");
        }

        await showMessage.alert("OTP sent to your registered mobile number", "success");

        const otp = await showMessage.prompt('Please enter OTP:');

        if (!otp) {
            showAlert("OTP is required", "error");
            return;
        }

        const deleteResponse = await fetch("/api/user/delete", {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp: otp })
        });

        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.message || 'Failed to delete account');
        }

        showMessage.success('Account deleted successfully');

        localStorage.clear();
        sessionStorage.clear();

        setTimeout(() => {
            window.location.href = '/otp-login.html';
        }, 1500);

    } catch (error) {
        showAlert(error.message || 'Error deleting account', 'error');
        console.error(error);
    }
});

document.getElementById('editProfileBtn').addEventListener('click', function() {
    enableEditMode();
});

document.getElementById('changePasswordBtn').addEventListener('click', function() {
    saveProfile();
});

window.addEventListener('DOMContentLoaded', loadUserData);


/* ==========================================================================
   ORDERS LOGIC — unchanged from scripts/installment-payment.js (as already
   fixed in this conversation: token key, customer-name fallback, the
   undefined orderData reference, the missing `return`s, order-level badge
   colors). The ONLY thing that changed is render()'s output markup — cards
   became table rows — and it now shows an empty state when there are no
   orders (the original left the container blank in that case). Every
   computed value (formatMoney, formatDateTime, statusBadgeClass, the
   installment sort, the Pay Now condition) is untouched.
   ========================================================================== */

let orders=[];

const userId= localStorage.getItem('user_id');
const token= localStorage.getItem('user_token');
let orderObj;
 async function fetchOrder(){
    try{
        const response= await fetch(`/api/orders/${userId}`,{
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            showMessage.error("Failed to fetch orders");
        }else{
            const data= await response.json();
            orders= data;
            render();
        }
    }catch(error){
        showMessage.error(error);
    }
 }


 function formatMoney(amount) {
     if (amount === undefined || amount === null) return "Rs. 0";
     const num = Number(amount);
     if (isNaN(num)) return "Rs. 0";
     return "Rs. " + num.toLocaleString("en-IN");
 }

 function formatDateTime(isoString) {
     const [datePart, timePart] = isoString.split("T");
     const [year, month, day] = datePart.split("-");
     const time = timePart.split(".")[0];
     return {
         date: `${day}-${month}-${year.slice(-2)}`,
         time: time
     };
 }

 function statusBadgeClass(status) {
     const s = (status || "").toUpperCase();
     if (["COMPLETED", "PAID", "SUCCESS", "CONFIRMED", "DELIVERED"].includes(s)) return "badge-green";
     if (["FAILED", "CANCELLED", "REJECTED"].includes(s)) return "badge-red";
     return "badge-yellow";
 }

 function toggle(id) {
     var el = document.getElementById("inst-" + id);
     if (el.classList.contains("show")) {
         el.classList.remove("show");
     } else {
         el.classList.add("show");
     }
 }

 function render() {
     var container = document.getElementById("orders");

     const ordersStatNumber = document.getElementById('ordersStatNumber');
     if (ordersStatNumber) ordersStatNumber.textContent = orders.length;

     if (orders.length === 0) {
         container.innerHTML = '<tr><td colspan="6"><div class="rc-orders-empty"><div class="icon">📦</div><p>You haven\'t placed any orders yet.</p></div></td></tr>';
         return;
     }

     var html = "";

     for (var i = 0; i < orders.length; i++) {
         var order = orders[i];
         var paidCount = 0;

         orderObj= order;

         for (var j = 0; j < order.installmentsList.length; j++) {
             if (order.installmentsList[j].installmentStatus === "PAID") {
                 paidCount++;
             }
         }

         html += '<tr class="rc-order-row">';
         html += '<td class="order-num">' + order.merchantOrderId + '</td>';
         html += '<td class="order-date">' + formatDateTime(order.createdAt).date + '<br>' + formatDateTime(order.createdAt).time + '</td>';
         html += '<td><div class="badges">';
         html += '<span class="badge ' + statusBadgeClass(order.orderStatus) + '">' + order.orderStatus + '</span>';
         html += '<span class="badge ' + statusBadgeClass(order.paymentStatus) + '">' + order.paymentStatus + '</span>';
         html += '</div></td>';
         html += '<td>' + formatMoney(order.totalAmount) + '</td>';
         html += '<td>' + formatMoney(order.paidAmount) + '</td>';
         html += '<td><button class="toggle-btn" onclick="toggle(' + order.id + ')">' + paidCount + '/' + order.totalInstallments + ' paid <i data-lucide="chevron-down" width="12" height="12"></i></button></td>';
         html += '</tr>';

         html += '<tr class="rc-order-detail-row"><td colspan="6">';
         html += '<div id="inst-' + order.id + '" class="installments">';

         html += '<div class="rc-order-detail-grid">';
         html += '<div class="rc-info-box">';
         html += '<h3>Customer</h3>';
         html += '<p><strong>' + (order.customerName || 'User') + '</strong></p>';
         html += '<p>' + order.customerPhone + '</p>';
         html += '<p>' + order.customerEmail + '</p>';
         html += '</div>';

         html += '<div class="rc-info-box">';
         html += '<h3>Items</h3>';
         for (var k = 0; k < order.ordertemList.length; k++) {
             html += '<p>' + order.ordertemList[k].packageName + '</p>';
             html += '<p>Qty: ' + order.ordertemList.length + ' x ' + formatMoney(order.ordertemList[k].totalAmount) + '</p>';
         }
         html += '</div>';
         html += '</div>';

         html += '<div class="rc-installments-title">Installment Schedule</div>';

         order.installmentsList.sort((a, b) => a.installmentNumber - b.installmentNumber);

         for (var m = 0; m < order.installmentsList.length; m++) {
              var inst = order.installmentsList[m];

              var isPending= inst.installmentStatus === "PENDING";
              var isUnlocked= inst.unlocked === true;
              var badgeClass = inst.installmentStatus === "PAID" ? "badge-green" : "badge-yellow";
              html += '<div class="installment-item">';
              html += '<div><span>' + (m+1) + '</span> <span style="margin-left: 10px;">Due: ' + formatDateTime(inst.dueDate).date + '</span></div>';
              html += '<div><span style="margin-right: 10px;">' + formatMoney(inst.installmentAmount) + '</span>';
              if (isUnlocked && isPending) {
                  html += '<button class="pay-now-btn" onclick="payInstallment(' + inst.id + ', ' + inst.installmentAmount + ')">Pay Now</button>';
              } else {
                  html += '<span class="badge ' + badgeClass + '">' + inst.installmentStatus + '</span>';
              }
              html += '</div>';
              html += '</div>';
         }
         html += '</div>';
         html += '</td></tr>';
     }

     container.innerHTML = html;
     if (window.lucide) lucide.createIcons();
 }


//=================== pay installment =======================

let merchantOrderId;
let orderId;
async function payInstallment(installmentId, amount){

    merchantOrderId= `TXN_${orderObj.id}_${installmentId}_${Date.now()}`;
    localStorage.setItem("merchantOrderId", merchantOrderId);
    orderId= orderObj.id;

    try{
        const paymentData = {
            merchantOrderId: merchantOrderId || `ORD${Date.now()}`,
            amount: amount*100,
            metaInfo: {
                udf1: orderObj.userId || '',
                udf2: orderObj.customerName || '',
                udf3: orderObj.customerEmail || '',
                udf4: orderObj.customerPhone || '',
                udf5: installmentId || '',
                udf6: JSON.stringify({ orderId: orderObj.id })
            }
        };

        const response= await fetch('/api/payment/phonePe/initiate',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });

        if(!response.ok){
            showMessage.error("Failed to initiate payment");
            return;
        }

        const paymentResult = await response.json();

        if (!paymentResult.redirectUrl) {
            throw new Error(paymentResult.message || 'Payment initiation failed');
        }

        window.PhonePeCheckout.transact(
        {
            tokenUrl: paymentResult.redirectUrl, callback, type: "IFRAME"
        });
    }catch(e){
        showMessage.error("Failed to process payment: " + e.message);
    }
}

function callback (response) {
  if (response === 'USER_CANCEL') {
    showMessage.error("Payment is cancelled by user");
    setTimeout(() => {
        window.location.reload();
    }, 2000);
    return;
  } else if (response === 'CONCLUDED') {
    showMessage.success("Payment successfully!");
    checkOrderStatus();
    return;
  }
}

async function checkOrderStatus(){
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const statusResponse = await fetch(`/api/payment/phonePe/status/${merchantOrderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!statusResponse.ok) {
            showMessage.error('Failed to verify payment status');
            return;
        }

        const statusResult = await statusResponse.json();

        if (statusResult.state === 'COMPLETED') {
            await verifyAndCompleteOrder(
                orderId,
                merchantOrderId,
                statusResult
            );
            console.log('payment completed');
        } else if (statusResult.state === 'FAILED') {
            showMessage.error('Payment failed. Please try again.');
        } else if (statusResult.state === 'PENDING') {
            await showMessage.alert('Payment is being processed. We will notify you once completed.');
        }

    } catch (error) {
        await showMessage.alert('Failed to verify payment.');
    }
}

async function verifyAndCompleteOrder(orderId, merchantOrderId, paymentStatus) {
    try {
        const verifyResponse = await fetch('/api/orders/verify-installment-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId: orderId,
                merchantOrderId: merchantOrderId,
                phonePeOrderId: paymentStatus.orderId,
                paymentState: paymentStatus.state,
                amount: paymentStatus.amount,
                paymentDetails: paymentStatus.paymentDetails
            })
        });
        console.log(paymentStatus.paymentDetails);

        if (!verifyResponse.ok) {
            showMessage.error('Payment verification failed');
            return;
        }

        const verifyResult = await verifyResponse.json();

        await showMessage.alert('Payment successful! Your order has been placed.',{
            title: 'success',
            type: 'success'
        });

        sessionStorage.setItem('completedOrder', JSON.stringify({
            orderId: orderId,
            merchantOrderId: merchantOrderId,
            amount: paymentStatus.amount,
            timestamp: new Date().toISOString()
        }));

        window.location.reload();

    } catch (error) {
        await showMessage.alert('Payment completed but verification failed. Please contact support.');
    }
}

document.addEventListener("DOMContentLoaded", () => { fetchOrder(); if (window.lucide) lucide.createIcons(); });


/* ==========================================================================
   DASHBOARD NAV — new, additive only. Switches which panel is visible;
   does not touch any of the logic above. Also honors #orders in the URL
   so a link like profile.html#orders opens straight to the Orders panel
   (useful once cart.html's order-history button points here instead of
   the old standalone installment-payment.html).
   ========================================================================== */

function rcShowPanel(panelId) {
    document.querySelectorAll('.rc-dash-nav-link[data-panel]').forEach((l) => l.classList.remove('active'));
    document.querySelector(`.rc-dash-nav-link[data-panel="${panelId}"]`).classList.add('active');
    document.querySelectorAll('.rc-dash-panel').forEach((p) => p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
}

document.querySelectorAll('.rc-dash-nav-link[data-panel]').forEach((link) => {
    link.addEventListener('click', () => rcShowPanel(link.dataset.panel));
});

document.getElementById('ordersStatCard').addEventListener('click', () => rcShowPanel('panelOrders'));

if (window.location.hash === '#orders') rcShowPanel('panelOrders');