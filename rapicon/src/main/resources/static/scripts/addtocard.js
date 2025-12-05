// User session data (stored in memory, not localStorage)
let userToken = localStorage.getItem('user_token');
let userId = localStorage.getItem('user_id');

// Cart state
let cartList = [];
let totalPayableAmount = 0;
let totalInstallments = 0;
let installmentAmount = 0;
let merchantOrderId;
let orderId;

// Render cart items
async function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');

    if (!userToken || !userId) {
        console.error('User not authenticated');
        return;
    }

    try {
        const response = await fetch(`/api/cart/items?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart items');
        }

        cartList = await response.json();
        cartBadge.textContent = `${cartList.length} Items`;

        if (cartList.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 1rem;">Your cart is empty</p>
                    <button onclick="window.location.href='/user.html'" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Continue Shopping
                    </button>
                </div>
            `;
        } else {
            // Get totalInstallments from first item
            totalInstallments = cartList[0].totalInstallments || 1;

            cartContainer.innerHTML = cartList.map(item => `
                <div class="cart-item">
                    <img src="${item.design.elevationUrls[0]}" alt="${item.design.designCategory}" class="item-image">
                    <div class="item-details">
                        <div class="item-header">
                            <div>
                                <div class="item-name">Package: ${item.packageName}</div>
                                <div class="item-category">${item.design.designCategory || item.design.designType}</div>
                            </div>
                            <button class="btn-remove" onclick="removeItem(${item.id})">🗑️</button>
                        </div>
                        <div class="item-footer">
                            <span class="item-price">Price: ₹${item.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        updateSummary();
    } catch (error) {
        console.error('Error loading cart:', error);
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <p style="color: #ef4444;">Failed to load cart items</p>
            </div>
        `;
    }
}

// Remove item from cart
async function removeItem(id) {
    if (!userToken) {
        alert('Please login to continue');
        return;
    }

    try {
        const response = await fetch(`/api/cart/delete?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete cart item');
        }

        renderCart();
    } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item from cart');
    }
}

// Update order summary
function updateSummary() {
    const subtotal = cartList.reduce((sum, item) => sum + item.totalAmount, 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    totalPayableAmount = total;
    installmentAmount = totalInstallments > 1 ? (total / totalInstallments) : total;

    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `₹${tax.toLocaleString()}`;
    document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('installment').textContent = `₹${installmentAmount.toLocaleString()}`;
    document.getElementById('modalTotal').textContent = `₹${total.toLocaleString()}`;

    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutBtnSecond = document.getElementById('checkoutBtnSecond');

    if (checkoutBtn) checkoutBtn.disabled = cartList.length === 0;
    if (checkoutBtnSecond) checkoutBtnSecond.disabled = cartList.length === 0;
}

// Full payment checkout
function fullCheckout() {
    if (cartList.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const orderData = {
        userId: cartList[0].userId,
        totalAmount: totalPayableAmount,
        cartList: cartList,
        totalInstallments: 1,
        installmentAmount: totalPayableAmount
    };

    openCheckout(orderData);
}

// Installment checkout
function installmentCheckout() {
    if (cartList.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const orderData = {
        userId: cartList[0].userId,
        totalAmount: totalPayableAmount,
        cartList: cartList,
        totalInstallments: totalInstallments,
        installmentAmount: installmentAmount
    };

    openCheckout(orderData);
}

// Main checkout function - PhonePe Integration
async function openCheckout(orderData) {
    if (!userToken) {
        alert('Please login to continue');
        return;
    }

    try {
        showPaymentVerificationLoader();

        // Step 1: Create order
        const orderResponse = await fetch('/api/orders/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to create order');
        }

        const orderResult = await orderResponse.json();

        // store merchant and order id
        merchantOrderId= orderResult.merchantOrderId;
        orderId= orderResult.id;


        // Step 2: Initiate PhonePe payment
        const paymentData = {
            merchantOrderId: orderResult.merchantOrderId || `ORD${Date.now()}`,
            amount: orderResult.amount, // Amount in paisa
            metaInfo: {
                udf1: orderResult.userId || orderData.userId || '',
                udf2: orderResult.customerName || '',
                udf3: orderResult.customerEmail || '',
                udf4: orderResult.customerPhone || '',
                udf5: JSON.stringify({ orderId: orderResult.id })
            }
        };

        const paymentResponse = await fetch('/api/payment/phonePe/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(paymentData)
        });

        if (!paymentResponse.ok) {
            throw new Error('Failed to initiate payment');
        }

        const paymentResult = await paymentResponse.json();

        if (!paymentResult.redirectUrl) {
            throw new Error(paymentResult.message || 'Payment initiation failed');
        }

        console.log('Payment initiated:', paymentResult);

        // open phonepe UI
        window.PhonePeCheckout.transact(
        {
            tokenUrl: paymentResult.redirectUrl, callback, type: "IFRAME"
        });

    } catch (error) {
        console.error('Checkout error:', error);
        //hidePaymentVerificationLoader();
        alert('Failed to process checkout: ' + error.message);
    }
}

// callback function
function callback (response) {
  if (response === 'USER_CANCEL') {
    /* Add merchant's logic if they have any custom thing to trigger on UI after the transaction is cancelled by the user*/
    console.log("user cancel the payment");
    window.location.href='/addtocard.html'
    return;
  } else if (response === 'CONCLUDED') {
    console.log("payment successfully");
    checkOrderStatus();
    /* Add merchant's logic if they have any custom thing to trigger on UI after the transaction is in terminal state*/
    return;
  }
}

async function checkOrderStatus(){
    // Payment process concluded, verify the payment status
    console.log('Payment concluded, verifying status...');

    // Wait a bit for PhonePe to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // Verify payment status from backend
        const statusResponse = await fetch(`/api/payment/phonePe/status/${merchantOrderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!statusResponse.ok) {
            throw new Error('Failed to verify payment status');
        }

        const statusResult = await statusResponse.json();

        // Check payment state
        if (statusResult.state === 'COMPLETED') {
            // Payment successful - verify with your backend
            await verifyAndCompleteOrder(
                orderId,
                merchantOrderId,
                statusResult
            );
            console.log('order completed');

        } else if (statusResult.state === 'FAILED') {
            // Payment failed
            //hidePaymentVerificationLoader();
            alert('Payment failed. Please try again.');
            //await updateOrderStatus(orderResult.id, 'FAILED', token);

        } else if (statusResult.state === 'PENDING') {
            // Payment still pending - poll status
            //hidePaymentVerificationLoader();
            alert('Payment is being processed. We will notify you once completed.');
            // Optionally implement polling mechanism
            //pollPaymentStatus(paymentResult.merchantOrderId, orderResult.id, token, 0);
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        //hidePaymentVerificationLoader();
        alert('Failed to verify payment. Please contact support with order ID: ');
    }
}

// Verify and Complete Order
async function verifyAndCompleteOrder(orderId, merchantOrderId, paymentStatus) {
    try {
        const verifyResponse = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
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
            throw new Error('Payment verification failed');
        }

        const verifyResult = await verifyResponse.json();

        //hidePaymentVerificationLoader();

        // Show success message
        alert(verifyResult.message || 'Payment successful! Your order has been placed.');

        // Clear cart
        /*if (typeof cartList !== 'undefined') {
            cartList = [];
            localStorage.removeItem('cart');
        }*/

        // Store order data in sessionStorage for further processing
        sessionStorage.setItem('completedOrder', JSON.stringify({
            orderId: orderId,
            merchantOrderId: merchantOrderId,
            amount: paymentStatus.amount,
            timestamp: new Date().toISOString()
        }));

        // Redirect to success page or order details
        // window.location.href = `/order-success?orderId=${orderId}`;

        // Or reload the page to show updated cart
        // window.location.reload();

    } catch (error) {
        console.error('Order verification error:', error);
        //hidePaymentVerificationLoader();
        alert('Payment completed but verification failed. Please contact support.');
    }
}


// Navigate to order history
function toggleOrderHistory() {
    window.location.href = '/installment-payment.html';
}

// Close checkout modal
function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Show loading indicator
function showPaymentVerificationLoader() {
    const loader = document.createElement('div');
    loader.id = 'payment-verification-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    loader.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #5f259f;
                        border-radius: 50%; width: 50px; height: 50px;
                        animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #333; font-size: 16px; margin: 0;">Processing Payment...</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">Please wait</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    document.body.appendChild(loader);
}

// Hide loading indicator
function hidePaymentVerificationLoader() {
    const loader = document.getElementById('payment-verification-loader');
    if (loader) {
        loader.remove();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const checkoutModal = document.getElementById('checkoutModal');
    const historyModal = document.getElementById('orderHistoryModal');

    if (event.target === checkoutModal) {
        closeCheckout();
    }
    if (event.target === historyModal) {
        toggleOrderHistory();
    }
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get user credentials from your auth system
    // For now, you need to set these after login
    // Example: initUserSession(token, userId);

    // If you have a way to retrieve session, do it here
    // Otherwise, this should be called from your login handler

    renderCart();
});