document.addEventListener("DOMContentLoaded", fetchOrder);
let orders=[];

 async function fetchOrder(){
    const userId= localStorage.getItem('user_id');
    const token= localStorage.getItem('user_token');

    try{
        const response= await fetch(`/api/orders/${userId}`,{
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            throw new Error("Failed to fetch orders");
        }else{
            const data= await response.json();
            orders= data;
            console.log("orders: "+ orders);
            render();
        }
    }catch(error){
        console.log("Error", error);
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
         for (var m = 0; m < order.installmentsList.length; m++) {
             var inst = order.installmentsList[m];
             var badgeClass = inst.installmentStatus === "PAID" ? "badge-green" : "badge-yellow";
             html += '<div class="installment-item">';
             html += '<div><span>' + (m+1) + '</span> <span style="margin-left: 10px;">Due: ' + formatDateTime(inst.dueDate).date + '</span></div>';
             html += '<div><span style="margin-right: 10px;">' + formatMoney(inst.installmentAmount) + '</span>';
             html += '<span class="badge ' + badgeClass + '">' + inst.installmentStatus + '</span></div>';
             html += '</div>';
         }
         html += '</div>';

         html += '</div>';
     }

     container.innerHTML = html;
 }
