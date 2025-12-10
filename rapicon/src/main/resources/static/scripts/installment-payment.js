document.addEventListener("DOMContentLoaded", fetchOrder);
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

     const num = Number(amount);  // Convert BigDecimal string to number safely

     if (isNaN(num)) return "Rs. 0";  // avoid crashes

     return "Rs. " + num.toLocaleString("en-IN");  // Indian currency format
 }

 function formatDateTime(isoString) {
     const [datePart, timePart] = isoString.split("T");

     const [year, month, day] = datePart.split("-");
     const time = timePart.split(".")[0]; // remove milliseconds

     return {
         date: `${day}-${month}-${year.slice(-2)}`, // dd-mm-yy
         time: time                                   // hh:mm:ss
     };
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
     var html = "";

     for (var i = 0; i < orders.length; i++) {
         var order = orders[i];
         var paidCount = 0;

         orderObj= order;

         // formate date and time
         const date= order.createdAt.split("T")[0];
         const time= order.createdAt.split("T")[1].split(".")[0]

         for (var j = 0; j < order.installmentsList.length; j++) {
             if (order.installmentsList[j].installmentStatus === "PAID") {
                 paidCount++;
             }
         }

         html += '<div class="order-card">';
         html += '<div class="order-header">';
         html += '<div>';
         html += '<div class="order-number">Order ' + order.merchantOrderId + '</div>';
         html += '<div style="color: #666; font-size: 14px;">Placed on ' + formatDateTime(order.createdAt).date + " " +  formatDateTime(order.createdAt).time + '</div>';
         html += '</div>';
         html += '<div>';
         html += '<span class="badge badge-green">' + order.orderStatus + '</span>';
         html += '<span class="badge badge-green">' + order.paymentStatus + '</span>';
         html += '</div>';
         html += '</div>';

         html += '<div class="order-info">';
         html += '<div class="info-box">';
         html += '<h3>Customer</h3>';
         html += '<p><strong>' + order.customerName || 'User' + '</strong></p>';
         html += '<p>' + order.customerPhone + '</p>';
         html += '<p>' + order.customerEmail + '</p>';
         html += '</div>';

         html += '<div class="info-box">';
         html += '<h3>Payment</h3>';
         html += '<p>Total: ' + formatMoney(order.totalAmount) + '</p>';
         html += '<p>Paid: ' + formatMoney(order.paidAmount) + '</p>';
         html += '<p>' + formatMoney(order.installmentAmount) + '/month x ' + order.totalInstallments + ' months</p>';
         html += '</div>';

         html += '<div class="info-box">';
         html += '<h3>Items</h3>';
         for (var k = 0; k < order.ordertemList.length; k++) {
             html += '<p>' + order.ordertemList[k].packageName + '</p>';
             html += '<p>Qty: ' + order.ordertemList.length + ' x ' + formatMoney(order.ordertemList[k].totalAmount) + '</p>';
         }
         html += '</div>';
         html += '</div>';

         html += '<button class="toggle-btn" onclick="toggle(' + order.id + ')">';
         html += 'Installment Schedule (' + paidCount + '/' + order.totalInstallments + ' paid) ▼';
         html += '</button>';

         html += '<div id="inst-' + order.id + '" class="installments">';

         // First sort the list
         order.installmentsList.sort((a, b) => a.installmentNumber - b.installmentNumber);

         for (var m = 0; m < order.installmentsList.length; m++) {
              var inst = order.installmentsList[m];

              var isPending= inst.installmentStatus === "PENDING";
              var isUnlocked= inst.unlocked === true;
              var badgeClass = inst.installmentStatus === "PAID" ? "badge-green" : "badge-yellow";
              html += '<div class="installment-item">';
              html += '<div><span>' + (m+1) + '</span> <span style="margin-left: 10px;">Due: ' + formatDateTime(inst.dueDate).date + '</span></div>';
              html += '<div><span style="margin-right: 10px;">' + formatMoney(inst.installmentAmount) + '</span>';
              // 🔥 Condition: show Pay Now
              if (isUnlocked && isPending) {
                  html += '<button class="pay-now-btn" onclick="payInstallment(' + inst.id + ', ' + inst.installmentAmount + ')">Pay Now</button>';
              } else {
                  // Otherwise show status
                  html += '<span class="badge ' + badgeClass + '">' + inst.installmentStatus + '</span>';
              }

              html += '</div>';
              html += '</div>';
         }
         html += '</div>';

         html += '</div>';
     }

     container.innerHTML = html;
 }


//=================== pay installment =======================

let merchantOrderId;
let orderId;
async function payInstallment(installmentId, amount){

    // set merchant and order id's
    merchantOrderId= `TXN_${orderObj.id}_${installmentId}_${Date.now()}`;

    // set merchant id in local storage
    localStorage.setItem("merchantOrderId", merchantOrderId);

    orderId= orderObj.id;

    try{
        const paymentData = {
            merchantOrderId: merchantOrderId || `ORD${Date.now()}`,
            amount: amount*100, // Amount in paisa
            metaInfo: {
                udf1: orderObj.userId || orderData.userId || '',
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
        }

        const paymentResult = await response.json();

        if (!paymentResult.redirectUrl) {
            throw new Error(paymentResult.message || 'Payment initiation failed');
        }

        // open phonepe UI
        window.PhonePeCheckout.transact(
        {
            tokenUrl: paymentResult.redirectUrl, callback, type: "IFRAME"
        });
    }catch(e){
        showMessage.error("Failed to process payment: " + e.message);
    }
}

// callback function
function callback (response) {
  if (response === 'USER_CANCEL') {
    showMessage.error("Payment is cancelled by user");

    // wait 2 sec before redirect
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

    // Wait a bit for PhonePe to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // Verify payment status from backend
        const statusResponse = await fetch(`/api/payment/phonePe/status/${merchantOrderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!statusResponse.ok) {
            showMessage.error('Failed to verify payment status');
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

// Verify and Complete Order
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
        }

        const verifyResult = await verifyResponse.json();

        // Show success message
        await showMessage.alert('Payment successful! Your order has been placed.',{
            title: 'success',
            type: 'success'
        });

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
        window.location.reload();

    } catch (error) {
        await showMessage.alert('Payment completed but verification failed. Please contact support.');
    }
}