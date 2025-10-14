// Sample cart data
    let cartItems = [
        {
            id: 1,
            name: 'Modern Logo Design',
            price: 2999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop',
            category: 'Logo Design'
        },
        {
            id: 2,
            name: 'Website UI Kit',
            price: 4999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            category: 'UI/UX Design'
        }
    ];

    // Order history data
    const orderHistory = [
        {
            id: 'ORD-2024-001',
            date: '2024-10-01',
            items: 2,
            total: 7998,
            status: 'Delivered'
        },
        {
            id: 'ORD-2024-002',
            date: '2024-09-15',
            items: 1,
            total: 2999,
            status: 'Completed'
        }
    ];

    let cartList=[];
    let totalPayableAmount=0;

    // Render cart items
    async function renderCart() {
        const cartContainer = document.getElementById('cartItems');
        const cartBadge = document.getElementById('cartBadge');

        const token= localStorage.getItem('token');
        const user_id= localStorage.getItem('id');

        const response= await fetch("/api/cart/items?user_id=" +user_id,
        {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });
        if(!response.ok){
            throw new Error("Failed to fetch items");
        }
        cartList= await response.json();


        cartBadge.textContent = `${cartList.length} Items`;

        if (cartList.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 1rem;">Your cart is empty</p>
                    <button style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Continue Shopping
                    </button>
                </div>
            `;
        } else {
            cartContainer.innerHTML = cartList.map(function(item) {
            return '<div class="cart-item">' +
                '<img src="' + item.design.imageUrl + '" alt="' + item.design.title + '" class="item-image">' +
                '<div class="item-details">' +
                    '<div class="item-header">' +
                        '<div>' +
                            '<div class="item-name">' + item.design.title + '</div>' +
                            '<div class="item-category">' + item.design.designType + '</div>' +
                        '</div>' +
                        '<button class="btn-remove" onclick="removeItem(' + item.id + ')">🗑️</button>' +
                    '</div>' +
                    '<div class="item-footer">' +
                       /* '<div class="quantity-control">' +
                            '<button class="qty-btn" onclick="updateQuantity(' + item.id + ', -1)">−</button>' +
                            *//*'<span class="qty-display">' + item.quantity + '</span>' +*//*
                            '<button class="qty-btn" onclick="updateQuantity(' + item.id + ', 1)">+</button>' +
                        '</div>' +*/
                        '<span class="item-price">₹' + (item.design.price).toLocaleString() + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
        }

        updateSummary();
    }

    // Update quantity
    function updateQuantity(id, delta) {
        const item = cartItems.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + delta);
            renderCart();
        }
    }

    // Remove item
    async function removeItem(id) {
        const token= localStorage.getItem('token');

        const response= await fetch("/api/cart/delete?id="+id,
        {
            method: 'DELETE',
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            throw new Error("Error to delete cart item");
        }
        renderCart();
    }

    // Update order summary
    function updateSummary() {
        const subtotal = cartList.reduce((sum, item) => sum + (item.design.price), 0);
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + tax;
        totalPayableAmount=total;

        document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
        document.getElementById('tax').textContent = `₹${tax.toLocaleString()}`;
        document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
        document.getElementById('modalTotal').textContent = `₹${total.toLocaleString()}`;

        document.getElementById('checkoutBtn').disabled = cartList.length === 0;
    }

   function openCheckout() {
        if (cartList.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const allDesigns = cartList.flatMap(cart => cart.design);

        const orderData = {
            userId: cartList[0].userId,
            totalAmount: totalPayableAmount,
            designList: allDesigns
        };

        const token = localStorage.getItem('token');

        fetch("/api/orders/create-order", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        })
        .then(res => res.json())
        .then(data => {
            const options = {
                key: data.key,              // ✅ received from backend
                amount: data.amount,
                currency: data.currency,
                name: "Rapicon Infrastructure Llp",
                description: "Design Purchase",
                order_id: data.razorpayOrderId,           // Razorpay Order ID
                handler: function (response) {
                    fetch("/api/orders/verify-payment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            orderId: data.id,
                            userId: orderData.userId
                        })
                    })
                    .then(res => res.json())
                    .then(result => {
                        alert(result.message || "Payment verified successfully!");
                        cartList = [];
                    });
                },
                theme: { color: "#3399cc" }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        })
        .catch(err => console.error("Error creating order:", err));
   }



    // Close checkout modal
    function closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('active');
    }

    // Toggle order history

   async function toggleOrderHistory() {
       const modal = document.getElementById('orderHistoryModal');
       const content = document.getElementById('orderHistoryContent');
       const id = cartList?.[0]?.userId;

       if (!id) {
           alert("User ID not found.");
           return;
       }

       if (!modal.classList.contains('active')) {
           // Show loading message
           content.innerHTML = `<p>Loading your order history...</p>`;

           try {
               const token = localStorage.getItem('token');
               const response = await fetch(`/api/orders/fetch-order?id=${id}`, {
                   method: 'GET',
                   headers: {
                       'Content-Type': 'application/json',
                       'Authorization': `Bearer ${token}`
                   }
               });

               if (!response.ok) {
                   throw new Error(`Failed to fetch order history: ${response.status}`);
               }

               const orders = await response.json();
               console.log("Fetched orders:", orders);

               if (!Array.isArray(orders) || orders.length === 0) {
                   content.innerHTML = `<p>No orders found.</p>`;
                   return;
               }

               // Render order cards
               content.innerHTML = orders.map(order => `
                   <div class="order-history-item">
                       <div class="order-header">
                           <span class="order-number">${order.razorpayOrderId || order.id}</span>
                           <span class="order-status ${order.paymentStatus === 'COMPLETED' ? 'status-completed' : 'status-pending'}">
                               ${order.paymentStatus || 'PENDING'}
                           </span>
                       </div>
                       <div class="order-details">
                           <span>Date: ${new Date(order.orderDate || order.createdAt).toLocaleDateString()}</span>
                           <span style="font-weight: 600; color: #1f2937;">Total: ₹${order.totalAmount?.toLocaleString() || 0}</span>
                       </div>
                   </div>
               `).join('');

           } catch (err) {
               console.error("Error fetching order history:", err);
               content.innerHTML = `<p>Error loading order history. Please try again later.</p>`;
           }

           modal.classList.add('active');
       } else {
           modal.classList.remove('active');
       }
   }



    /*function toggleOrderHistory() {
        const modal = document.getElementById('orderHistoryModal');
        const content = document.getElementById('orderHistoryContent');

        if (!modal.classList.contains('active')) {
            content.innerHTML = orderHistory.map(order => `
                <div class="order-history-item">
                    <div class="order-header">
                        <span class="order-id">${order.id}</span>
                        <span class="order-status ${order.status === 'Delivered' ? 'status-delivered' : 'status-completed'}">
                            ${order.status}
                        </span>
                    </div>
                    <div class="order-details">
                        <span>${order.date}</span>
                        <span>${order.items} items</span>
                        <span style="font-weight: 600; color: #1f2937;">₹${order.total.toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    }*/

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
    }

    // Handle checkout form submission
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = Math.round(subtotal * 1.18);

        const options = {
            key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
            amount: total * 100, // Amount in paise
            currency: 'INR',
            name: 'Design Studio',
            description: 'Design Purchase',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop',
            handler: function (response) {
                alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);
                cartItems = [];
                renderCart();
                closeCheckout();
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: '#667eea'
            }
        };

        const razorpay = new Razorpay(options);
        razorpay.open();
    });

    // Initialize cart on page load
    renderCart();